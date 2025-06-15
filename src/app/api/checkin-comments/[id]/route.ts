import { NextRequest, NextResponse } from "next/server";
import { makeAuthRequest } from "../../auth/make-auth-request";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
  // Extract the comment ID from the URL
  const id = request.url.split("/").pop();

  if (!id) {
    return NextResponse.json(
      { message: "Comment ID is required" },
      { status: 400 }
    );
  }

  try {
    const response = await makeAuthRequest(
      `/api/checkin-comments/${id}`,
      "DELETE",
      {}
    );

    // Return a more detailed success response
    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
      commentId: id,
      response,
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    if (
      error instanceof Error &&
      error.message === "No authentication token available"
    ) {
      return new NextResponse(null, { status: 401 });
    }
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to delete comment",
      },
      { status: 500 }
    );
  }
}
