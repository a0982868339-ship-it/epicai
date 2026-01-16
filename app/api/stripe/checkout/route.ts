
import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { supabase } from '../../../../lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { priceId, isSubscription, quantity = 1, userId, userEmail } = await req.json();

    if (!priceId || !userId) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // Define the success and cancel URLs
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    
    // Create the session params
    const sessionParams: any = {
      mode: isSubscription ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId, // You must pass a valid Stripe Price ID (e.g., price_12345)
          quantity: quantity,
        },
      ],
      customer_email: userEmail,
      metadata: {
        userId: userId,
        type: isSubscription ? 'subscription' : 'credits',
        amount: quantity, // For credit packs, how many credits to add
      },
      success_url: `${origin}/account?success=true`,
      cancel_url: `${origin}/account?canceled=true`,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
