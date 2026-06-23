export async function GET() {
  return Response.json({ success: true, message: "API sehat.", data: { status: "ok" } });
}
