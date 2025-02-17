import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const pvSystemId = searchParams.get("pvSystemId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/swqapi/pvsystems/${pvSystemId}/aggrdata?from=${from}&to=${to}`,
      {
        headers: {
          accept: "application/json",
          AccessKeyId: process.env.NEXT_PUBLIC_ACCESS_KEY_ID!,
          AccessKeyValue: process.env.NEXT_PUBLIC_ACCESS_KEY_VALUE!,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
