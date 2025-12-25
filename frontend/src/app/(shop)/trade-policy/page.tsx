export default function TradePolicyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-serif text-allure-black mb-8">
                Política de Troca e Devolução
            </h1>

            <div className="prose prose-lg max-w-none text-gray-600">
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-allure-black mb-4">
                        1. Prazo para Troca ou Devolução
                    </h2>
                    <p>
                        Você tem até <strong>30 dias corridos</strong> após o recebimento do produto
                        para solicitar troca ou devolução, conforme previsto no Código de Defesa do Consumidor.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-allure-black mb-4">
                        2. Condições do Produto
                    </h2>
                    <p>Para ser aceito, o produto deve estar:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                        <li>Sem uso, lavagem ou alterações</li>
                        <li>Com todas as etiquetas originais</li>
                        <li>Na embalagem original (quando aplicável)</li>
                        <li>Acompanhado da nota fiscal</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-allure-black mb-4">
                        3. Como Solicitar
                    </h2>
                    <p>Para iniciar o processo de troca ou devolução:</p>
                    <ol className="list-decimal pl-6 mt-2 space-y-2">
                        <li>Entre em contato pelo email <strong>suporte@alluremoda.com.br</strong></li>
                        <li>Informe o número do pedido e motivo da solicitação</li>
                        <li>Aguarde as instruções para envio do produto</li>
                        <li>Envie o produto conforme orientações recebidas</li>
                    </ol>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-allure-black mb-4">
                        4. Troca por Tamanho ou Cor
                    </h2>
                    <p>
                        Se o produto estiver em perfeitas condições, você pode trocar por outro tamanho
                        ou cor, sujeito à disponibilidade em estoque. O frete de retorno é por conta do cliente,
                        salvo em casos de erro da loja.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-allure-black mb-4">
                        5. Reembolso
                    </h2>
                    <p>
                        Em caso de devolução, o reembolso será processado em até <strong>10 dias úteis</strong>
                        após o recebimento e análise do produto. O valor será estornado na mesma forma de pagamento
                        utilizada na compra.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-allure-black mb-4">
                        6. Produtos com Defeito
                    </h2>
                    <p>
                        Em caso de defeito de fabricação, a AllureModa arca com todos os custos de envio
                        e oferece as seguintes opções:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                        <li>Troca por produto idêntico</li>
                        <li>Troca por produto de valor equivalente</li>
                        <li>Reembolso integral</li>
                    </ul>
                </section>

                <section className="bg-allure-beige p-6 rounded-lg">
                    <h2 className="text-xl font-semibold text-allure-black mb-2">
                        Dúvidas?
                    </h2>
                    <p>
                        Entre em contato com nosso suporte pelo email{" "}
                        <a href="mailto:suporte@alluremoda.com.br" className="text-allure-gold">
                            suporte@alluremoda.com.br
                        </a>{" "}
                        ou pelo WhatsApp{" "}
                        <a href="https://wa.me/5511999999999" className="text-allure-gold">
                            (11) 99999-9999
                        </a>
                        .
                    </p>
                </section>
            </div>
        </div>
    );
}
