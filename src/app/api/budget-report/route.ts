
import { generateBudgetReport } from '@/ai/flows/generate-budget-report';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { transactions } = await req.json();
    if (!transactions) {
      return NextResponse.json(
        { message: 'Transactions are required' },
        { status: 400 }
      );
    }
    const result = await generateBudgetReport({ transactions });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in budget report API:', error);
    return NextResponse.json(
      { message: `Failed to generate budget report: ${error.message}` },
      { status: 500 }
    );
  }
}
