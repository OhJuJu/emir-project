import Stripe from "stripe";
import Link from "next/link";
import { stripe } from "../../lib/stripe";

export default async function ReservationSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let session: Stripe.Checkout.Session | null = null;
  if (session_id) {
    try {
      session = await stripe.checkout.sessions.retrieve(session_id);
    } catch (err) {
      console.error("Impossible de récupérer la session Stripe :", err);
    }
  }

  const isPaid = session?.payment_status === "paid";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gris px-4 py-20 text-blanc">
      <div className="max-w-lg w-full bg-sable text-noir rounded-2xl p-8 sm:p-10 text-center space-y-4 shadow-2xl">
        {isPaid ? (
          <>
            <div className="text-4xl">✅</div>
            <h1 className="text-2xl font-serif uppercase tracking-wide text-rouge-fonce">
              Réservation confirmée
            </h1>
            <p className="text-sm text-noir/80">
              Merci ! Votre paiement a bien été validé. Vous allez recevoir une confirmation par e-mail et SMS
              avec tous les détails de votre course.
            </p>
            {session?.metadata?.departureAddress && session?.metadata?.arrivalAddress && (
              <p className="text-xs text-noir/60 pt-2 border-t border-noir/10">
                {session.metadata.departureAddress} → {session.metadata.arrivalAddress}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="text-4xl">⏳</div>
            <h1 className="text-2xl font-serif uppercase tracking-wide text-rouge-fonce">
              Paiement en cours de vérification
            </h1>
            <p className="text-sm text-noir/80">
              Si vous venez de payer, cela ne devrait prendre que quelques instants. Si le problème persiste,
              contactez-nous directement.
            </p>
          </>
        )}
        <Link
          href="/"
          className="inline-block mt-4 bg-rouge-fonce hover:bg-rouge-clair text-blanc font-serif uppercase tracking-wider py-3 px-6 rounded-xl text-sm font-semibold transition-all"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
