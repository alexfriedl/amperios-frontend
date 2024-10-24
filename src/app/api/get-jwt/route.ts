import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/swqapi/iam/jwt`,
      {
        userId: process.env.AMPERIOS_USER,
        password: process.env.AMPERIOS_PW,
      },
      {
        headers: {
          "Content-Type": "application/json",
          AccessKeyId: process.env.NEXT_PUBLIC_ACCESS_KEY_ID!,
          AccessKeyValue: process.env.NEXT_PUBLIC_ACCESS_KEY_VALUE!,
        },
      }
    );

    return NextResponse.json({ token: response.data.jwtToken });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
