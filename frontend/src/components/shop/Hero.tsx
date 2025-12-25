import Link from "next/link";

export function Hero() {
    return (
        <section
            className="relative h-[80vh] w-full bg-cover bg-center"
            style={{ backgroundImage: "url('https://www.chanel.com/puls-img/c_limit,w_1920/q_auto:good,dpr_auto,f_auto/1761661153726-ww-homepage-corpo-one-desktop_1255x2880.png')" }}
        >
            {/* Overlay escuro para melhor legibilidade do texto */}
            <div className="absolute inset-0 bg-black bg-opacity-20" />

            <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white p-4">
                <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight">
                    Elegância que Desperta
                </h1>
                <p className="mt-4 text-lg max-w-lg font-sans">
                    Descubra peças que causam impacto com qualidade premium.
                </p>
                <Link
                    href="/products"
                    className="mt-8 bg-allure-black text-white font-sans font-bold py-3 px-10 tracking-wide transition-all hover:bg-gray-800"
                >
                    Conheça a Coleção
                </Link>
            </div>
        </section>
    );
}
