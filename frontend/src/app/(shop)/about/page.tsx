import { Mission } from "@/components/shop";

export default function AboutPage() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative bg-allure-black text-white py-24">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif mb-4">Sobre a AllureModa</h1>
                    <p className="text-lg text-gray-300">
                        Elegância, sofisticação e estilo desde 2020
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <Mission />

            {/* Story Section */}
            <div className="max-w-4xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-serif text-allure-black mb-6 text-center">
                    Nossa História
                </h2>
                <div className="prose prose-lg mx-auto text-gray-600">
                    <p>
                        A AllureModa nasceu da paixão por moda feminina de alta qualidade.
                        Fundada em 2020, nossa missão sempre foi oferecer peças exclusivas
                        que combinam elegância atemporal com tendências contemporâneas.
                    </p>
                    <p>
                        Acreditamos que a moda é uma forma de expressão pessoal, e cada mulher
                        merece se sentir confiante e bela. Por isso, selecionamos cuidadosamente
                        cada peça do nosso catálogo, garantindo qualidade, conforto e estilo.
                    </p>
                    <p>
                        Hoje, atendemos milhares de clientes em todo o Brasil, mantendo nosso
                        compromisso com a excelência no atendimento e a satisfação de cada cliente.
                    </p>
                </div>
            </div>

            {/* Values Section */}
            <div className="bg-allure-beige py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-serif text-allure-black mb-12 text-center">
                        Nossos Valores
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Qualidade",
                                description: "Peças selecionadas com rigor, garantindo durabilidade e acabamento impecável.",
                            },
                            {
                                title: "Elegância",
                                description: "Design sofisticado que valoriza a beleza natural de cada mulher.",
                            },
                            {
                                title: "Atendimento",
                                description: "Suporte dedicado para garantir a melhor experiência de compra.",
                            },
                        ].map((value) => (
                            <div key={value.title} className="text-center">
                                <h3 className="text-xl font-serif text-allure-black mb-3">{value.title}</h3>
                                <p className="text-gray-600">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
