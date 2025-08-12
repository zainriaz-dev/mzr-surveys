import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { surveyId, title, description } = await req.json();
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    
    // Generate shareable URL
    const shareUrl = surveyId ? `${baseUrl}/survey/${surveyId}` : `${baseUrl}/survey`;
    
    // Generate social media sharing URLs
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title || "Pakistan Tech & Society Survey 2025");
    const encodedDescription = encodeURIComponent(description || "Share your voice about technology, healthcare, and youth issues in Pakistan");
    
    const socialUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}%20-%20${encodedDescription}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}%20-%20${encodedDescription}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20-%20${encodedDescription}%20${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}%20-%20${encodedDescription}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      sms: `sms:?body=${encodedTitle}%20-%20${encodedDescription}%20${encodedUrl}`
    };
    
    return NextResponse.json({
      ok: true,
      shareUrl,
      socialUrls,
      meta: {
        title,
        description,
        encodedTitle,
        encodedDescription
      }
    });
  } catch (error) {
    console.error("Share URL generation error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Failed to generate share URLs" 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const shareUrl = `${baseUrl}/survey`;
    
    return NextResponse.json({
      ok: true,
      shareUrl,
      stats: {
        totalShares: 0, // You can implement share tracking here
        platforms: {
          facebook: 0,
          twitter: 0,
          whatsapp: 0,
          linkedin: 0,
          telegram: 0,
          email: 0,
          sms: 0,
          direct: 0
        }
      }
    });
  } catch (error) {
    console.error("Share stats error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Failed to get share stats" 
    }, { status: 500 });
  }
}
