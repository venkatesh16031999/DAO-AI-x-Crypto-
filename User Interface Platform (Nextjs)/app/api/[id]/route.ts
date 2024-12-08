// app/api/data/route.js
import { NextResponse } from 'next/server';

export async function GET(req,{ params }) {
    const { id } = params;
    console.log("🚀 ~ GET ~ id:", id)
  try {
    // Replace this URL with your Ngrok server endpoint
    const apiUrl = 'https://a685-14-195-142-82.ngrok-free.app/organization/getOrganizationById/' + id;

    // Fetch data from the external API
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();

    // Return the fetched data as JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
