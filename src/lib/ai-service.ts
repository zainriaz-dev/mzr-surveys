/**
 * AI Service with Multiple Providers and Fallback System (NO CACHING)
 * Supports Azure OpenAI, Gemini, and DeepSeek with automatic failover
 */

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIProvider {
  name: string;
  makeRequest: (prompt: string, options?: AIRequestOptions) => Promise<string>;
  isAvailable: () => Promise<boolean>;
}

export interface AIRequestOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  systemPrompt?: string;
  model?: string;
}

class AIService {
  private providers: AIProvider[] = [];

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    const declaredOrder = (process.env.AI_PROVIDER_ORDER || '').split(',').map(s => s.trim()).filter(Boolean);

    const registry: Record<string, AIProvider | null> = {
      azure_openai_primary: null,
      azure_openai_secondary: null,
      gemini: null,
      deepseek: null,
    };

    // Build each available provider
    if (process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY) {
      registry.azure_openai_primary = this.createAzureOpenAIProvider(
        'azure_openai_primary',
        process.env.AZURE_OPENAI_ENDPOINT,
        process.env.AZURE_OPENAI_API_KEY,
        process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'model-router',
        process.env.AZURE_OPENAI_API_VERSION || '2024-06-01',
        process.env.AZURE_OPENAI_MODEL || 'gpt-4o-mini'
      );
    }

    if (process.env.AZURE_OPENAI_ENDPOINT_2 && process.env.AZURE_OPENAI_API_KEY_2) {
      registry.azure_openai_secondary = this.createAzureOpenAIProvider(
        'azure_openai_secondary',
        process.env.AZURE_OPENAI_ENDPOINT_2,
        process.env.AZURE_OPENAI_API_KEY_2,
        process.env.AZURE_OPENAI_DEPLOYMENT_NAME_2 || 'model-router',
        process.env.AZURE_OPENAI_API_VERSION || '2024-06-01',
        process.env.AZURE_OPENAI_MODEL_2 || 'gpt-4o'
      );
    }

    if (process.env.GEMINI_API_KEY) {
      registry.gemini = this.createGeminiProvider();
    }

    if (process.env.DEEPSEEK_API_KEY) {
      registry.deepseek = this.createDeepSeekProvider();
    }

    // Apply explicit order if provided, else default order
    const order = declaredOrder.length
      ? declaredOrder
      : ['azure_openai_primary', 'azure_openai_secondary', 'gemini', 'deepseek'];

    this.providers = order
      .map(name => registry[name])
      .filter((p): p is AIProvider => Boolean(p));

    console.log(`Initialized ${this.providers.length} AI providers in order: ${order.join(' -> ')}`);
  }

  private createAzureOpenAIProvider(
    name: string,
    endpoint: string,
    apiKey: string,
    deploymentName: string,
    apiVersion: string,
    defaultModel: string
  ): AIProvider {
    return {
      name,
      makeRequest: async (prompt: string, options: AIRequestOptions = {}): Promise<string> => {
        const url = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;
        
        const messages: AIMessage[] = [];
        if (options.systemPrompt) {
          messages.push({ role: 'system', content: options.systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        const requestBody = {
          messages,
          max_tokens: options.maxTokens || 500,
          temperature: options.temperature ?? Number(process.env.AI_TEMPERATURE ?? '0.2'),
          top_p: options.topP ?? Number(process.env.AI_TOP_P ?? '0.9'),
          frequency_penalty: 0,
          presence_penalty: 0,
          model: options.model || defaultModel // Use model from env or passed option
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': apiKey,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Azure OpenAI API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
      },
      isAvailable: async (): Promise<boolean> => {
        try {
          const testUrl = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;
          const testResponse = await fetch(testUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': apiKey,
            },
            body: JSON.stringify({
              messages: [{ role: 'user', content: 'test' }],
              max_tokens: 1,
              model: defaultModel
            }),
          });
          return testResponse.status !== 429 && testResponse.status !== 503;
        } catch {
          return false;
        }
      }
    };
  }

  private createGeminiProvider(): AIProvider {
    return {
      name: 'gemini',
      makeRequest: async (prompt: string, options: AIRequestOptions = {}): Promise<string> => {
        const apiKey = process.env.GEMINI_API_KEY;
        const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const fullPrompt = options.systemPrompt 
          ? `${options.systemPrompt}\n\nUser: ${prompt}` 
          : prompt;

        const requestBody = {
          contents: [{
            parts: [{ text: fullPrompt }]
          }],
          generationConfig: {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxTokens || 500,
            topP: 0.95,
            topK: 64
          }
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || '';
      },
      isAvailable: async (): Promise<boolean> => {
        try {
          const apiKey = process.env.GEMINI_API_KEY;
          const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
          const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const testResponse = await fetch(testUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'test' }] }],
              generationConfig: { maxOutputTokens: 1 }
            }),
          });
          return testResponse.status !== 429 && testResponse.status !== 503;
        } catch {
          return false;
        }
      }
    };
  }

  private createDeepSeekProvider(): AIProvider {
    return {
      name: 'deepseek',
      makeRequest: async (prompt: string, options: AIRequestOptions = {}): Promise<string> => {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        const url = 'https://api.deepseek.com/v1/chat/completions';
        const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

        const messages: AIMessage[] = [];
        if (options.systemPrompt) {
          messages.push({ role: 'system', content: options.systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        const requestBody = {
          model,
          messages,
          max_tokens: options.maxTokens || 500,
          temperature: options.temperature || 0.7,
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
      },
      isAvailable: async (): Promise<boolean> => {
        try {
          const apiKey = process.env.DEEPSEEK_API_KEY;
          if (!apiKey) return false;
          
          const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
              messages: [{ role: 'user', content: 'test' }],
              max_tokens: 1
            }),
          });
          return response.status !== 429 && response.status !== 503;
        } catch {
          return false;
        }
      }
    };
  }

  public async generateResponse(
    prompt: string, 
    options: AIRequestOptions = {}
  ): Promise<{ response: string; provider: string }> {
    // Try each provider in order
    let lastError: Error | null = null;
    
    for (const provider of this.providers) {
      try {
        console.log(`Attempting request with provider: ${provider.name}`);
        
        // Check if provider is available (not rate limited)
        const isAvailable = await provider.isAvailable();
        if (!isAvailable) {
          console.log(`Provider ${provider.name} is not available (likely rate limited)`);
          continue;
        }

        const response = await provider.makeRequest(prompt, options);
        
        if (response && response.trim()) {
          return { 
            response, 
            provider: provider.name
          };
        }
      } catch (error) {
        // Log detailed provider error only on server; never surface to client
        console.error(`Provider ${provider.name} failed:`, error);
        lastError = error as Error;
        continue;
      }
    }

    // If all providers fail, return a generic, user-safe error
    console.error('All AI providers failed. Last error:', lastError);
    throw new Error('AI service is temporarily unavailable. Please try again later.');
  }

  public async getProviderStatus(): Promise<{ name: string; available: boolean }[]> {
    const statuses = await Promise.all(
      this.providers.map(async (provider) => ({
        name: provider.name,
        available: await provider.isAvailable()
      }))
    );
    return statuses;
  }
}

// Export singleton instance
export const aiService = new AIService();