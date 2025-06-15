import { NextResponse } from "next/server";
import { makeAuthRequest } from "../../auth/make-auth-request";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Deleting comment:", params.id);
    const response = await makeAuthRequest(
      `/api/checkin-comments/${params.id}`,
      "DELETE",
      {}
    );
    console.log("Backend delete response:", response);

    // Return a simple success response
    return NextResponse.json({ success: true });
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
