"use client";
import Link from "next/link";
import Image from "next/image";

function HeroSection() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Velkomin á Abyrgi.is</h1>
      <p className="text-lg mb-6">
        Við sækjum bílinn þinn og keyrum hann örugglega heim, og ef þú vilt, færð þú líka far með!
      </p>
      <div className="flex justify-center">
        <Image
          src="/images/Car_with_logo.png"
          alt="Bíll með Abyrgi logo"
          width={700}
          height={350}
          className="rounded-xl my-8"
        />
      </div>
    </>
  );
}

function ServiceList() {
  return (
    <section className="my-8 text-base leading-relaxed">
      <strong className="block mb-2 text-xl">Þjónustan okkar:</strong>
      <ul className="list-disc ml-8 mb-4 space-y-2">
        <li>
          <b>Fyrir alla 17 ára og eldri:</b> Þú getur pantað ökumann sem keyrir bílinn þinn á milli staða, hvort sem þú vilt fara aðra leið sjálf/ur eða þarft að sækja bílinn þinn.
        </li>
        <li>
          <b>Ef þú ert of þreytt/ur eða undir áhrifum:</b> Við tryggjum að þú og bíllinn þinn komist heim örugglega, án þess að þú þurfir að keyra sjálf/ur.
        </li>
        <li>
          <b>Auðveld bókun:</b> Settu inn staðsetningu bílsins og áfangastað í appinu og við sendum ökumann til að sækja og keyra bílinn þinn.
        </li>
      </ul>
        <h2 className="text-lg font-semibold mb-1">Öryggi og traust</h2>
        <p>
          Öryggi þitt og bílsins þíns er okkar forgangsatriði. Allir okkar ökumenn eru reyndir, ábyrgir og vandlega valdir af okkur. Við mælum einungis með ökumönnum sem hafa sýnt fram á áreiðanleika og góða þjónustu. Þú getur verið viss um að bíllinn þinn er í öruggum höndum frá upphafi til enda.
        </p>
      <span>
        Markmið okkar er að tryggja að þú getir komið bílnum þínum á áfangastað á öruggan hátt, hvort sem þú getur eða vilt ekki keyra sjálf/ur. Þú þarft aldrei að biðja vin um hjálp eða taka áhættu á að keyra þreytt/ur eða undir áhrifum.
      </span>
    </section>
  );
}

function OrderButton() {
  return (
    <>
      {/* Desktop button */}
      <div className="hidden md:flex justify-center my-8">
        <Link href="/sign_up" className="no-underline">
          <button
            className="w-100 py-5 text-lg rounded-xl bg-[#E7ECEF] text-gray-900 shadow-lg hover:bg-[#d4e3ed] transition font-semibold border border-gray-300 cursor-pointer"
          >
            Panta
          </button>
        </Link>
      </div>
      {/* Mobile button */}
      <div className="md:hidden">
        <Link href="/sign_up" className="no-underline">
          <button
            className="fixed left-[5vw] right-[5vw] bottom-4 w-[90vw] py-4 text-lg rounded-xl bg-[#E7ECEF] text-gray-900 shadow-lg z-50 hover:bg-[#d4e3ed] transition font-semibold border border-gray-300 cursor-pointer"
          >
            Panta
          </button>
        </Link>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto p-6 min-h-screen font-sans">
      <HeroSection />
      <OrderButton />
      <ServiceList />
      <p className="text-lg mt-8">
        Þægileg og örugg þjónusta fyrir þig og bílinn þinn. Hafðu samband og við sjáum um restina!
      </p>
      {/* Custom link color */}
      <style jsx global>{`
        body {
          background: #E7ECEF;
          color: #222;
        }
        a, a:visited {
          color: #E7ECEF; 
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        @media (prefers-color-scheme: dark) {
          body {
            background: #15121aff;
            color: #f7f7f7;
          }
      `}</style>
    </main>
  );
}