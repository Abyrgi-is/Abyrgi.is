import Image from "next/image";

function WorkerCard({ src, name, role }: { src: string; name: string; role: string }) {
    return (
        <div className="flex flex-col items-center">
            <Image
                src={src}
                alt={name}
                width={250}
                height={350}
                className="rounded-xl shadow-md"
            />
            <p className="mt-3 text-lg font-semibold">{name}</p>
            <p className="text-sm text-gray-600">{role}</p>
        </div>
    );
}

export function ImagesSection() {
    return (
        <div className="flex justify-center gap-8 my-10">
            <WorkerCard src="/images/ari.png" name="Ari Frímannsson" role="Next Developer - Style Manager" />
            <WorkerCard src="/images/aron.png" name="Aron Frosti Davíðsson" role="Databse Manager" />
            <WorkerCard src="/images/Petur.jpg" name="Pétur Jónsson" role="Next Developer - Backend Manager" />
        </div>
    );
}

export default function AboutPage() {
    return (
        <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold my-6">Okkar Lið</h1>
            <ImagesSection />
        </div>
    );
}
