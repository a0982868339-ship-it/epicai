
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { supabase } from '../../../../lib/supabaseClient';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  if (event.type === 'checkout.session.completed') {
    const userId = session.metadata?.userId;
    const type = session.metadata?.type;
    const amount = parseInt(session.metadata?.amount || '0');

    if (userId) {
        if (type === 'credits') {
            // Logic: Fetch current credits -> Add new credits -> Update
            // Note: In a real Supabase app, use an RPC function to increment atomically
            // await supabase.rpc('increment_credits', { user_id: userId, amount: amount });
            
            // For now, we simulate a direct update if RPC isn't set up
            const { data: user } = await supabase.from('profiles').select('total_credits').eq('id', userId).single();
            if (user) {
                await supabase.from('profiles').update({ 
                    total_credits: (user.total_credits || 0) + amount 
                }).eq('id', userId);
            }
        } else if (type === 'subscription') {
            await supabase.from('profiles').update({ 
                subscription_plan: 'pro' // Simplified logic
            }).eq('id', userId);
        }
    }
  }

  return new NextResponse(null, { status: 200 });
}
