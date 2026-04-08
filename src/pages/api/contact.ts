import type { APIRoute } from 'astro';
import { Client } from '@notionhq/client';

export const prerender = false;

const notion = new Client({
  auth: import.meta.env.NOTION_API_KEY,
});

const DATABASE_ID = import.meta.env.NOTION_DATABASE_ID;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, email, company, role, message } = data;

    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: 'Name and email are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a new page in the Notion CRM database
    await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        // Name (title field)
        'Name': {
          title: [{ text: { content: name } }],
        },
        // Email
        'Email': {
          email: email,
        },
        // Company
        'Company': {
          rich_text: [{ text: { content: company || '' } }],
        },
        // Title/Role
        'Title': {
          rich_text: [{ text: { content: role || '' } }],
        },
        // Pain Signal (their message about operational headache)
        'Pain Signal': {
          rich_text: [{ text: { content: message || '' } }],
        },
        // Source
        'Source': {
          select: { name: 'Website' },
        },
        // Status
        'Status': {
          select: { name: 'New' },
        },
        // Added Date
        'Added Date': {
          date: { start: new Date().toISOString().split('T')[0] },
        },
        // Notes
        'Notes': {
          rich_text: [{ text: { content: `Submitted via heurystics.com contact form. Role: ${role || 'Not specified'}` } }],
        },
      },
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Notion API error:', error?.message || error);
    return new Response(
      JSON.stringify({ error: 'Failed to submit. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
