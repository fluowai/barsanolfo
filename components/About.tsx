import React from 'react';

const About: React.FC = () => (
  <section id="escritorio" className="bg-[#f3f1eb] py-24 md:py-32">
    <div className="mx-auto grid max-w-[1440px] gap-12 px-5 md:px-10 lg:grid-cols-[320px_1fr] lg:px-14">
      <div>
        <p className="section-label">Nossa forma de atuar</p>
        <p className="mt-8 max-w-xs text-sm leading-7 text-[#68716d]">Base fictícia em São Paulo, com atendimento nacional e uma rede de especialistas para demandas multidisciplinares.</p>
      </div>
      <div>
        <h2 className="max-w-5xl text-[clamp(2.3rem,5vw,5rem)] leading-[1.02] text-[#17211e]">Não entregamos respostas prontas. Construímos caminhos jurídicos que fazem sentido para cada decisão.</h2>
        <div className="mt-14 grid gap-8 border-t border-[#c9cbc5] pt-8 md:grid-cols-3">
          {[['01', 'Leitura de contexto', 'Entendemos negócio, pessoas e momento antes de propor qualquer movimento.'], ['02', 'Estratégia objetiva', 'Traduzimos complexidade em cenários claros, prioridades e próximos passos.'], ['03', 'Presença contínua', 'Acompanhamos a execução para que a estratégia não termine no parecer.']].map(([n, title, text]) => (
            <div key={n}>
              <span className="text-xs font-semibold text-[#9b8050]">{n}</span>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#68716d]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default About;
