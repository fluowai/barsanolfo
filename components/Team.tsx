import React from 'react';
import { TEAM } from '../constants';

const Team: React.FC = () => (
  <section id="equipe" className="bg-[#e5e8e1] py-24 md:py-32">
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-14">
      <div className="mb-14 grid gap-8 lg:grid-cols-[320px_1fr]">
        <p className="section-label">Sócios</p>
        <h2 className="max-w-4xl text-[clamp(2.4rem,5vw,5rem)] leading-none">Experiência que escuta antes de orientar.</h2>
      </div>
      <div className="grid gap-10 md:grid-cols-2">
        {TEAM.map((member) => (
          <article key={member.name} className="grid gap-6 border-t border-[#afb7b1] pt-6 sm:grid-cols-[minmax(180px,280px)_1fr]">
            <img src={member.image} alt={member.name} className="aspect-[4/5] h-full w-full object-cover" />
            <div className="flex flex-col justify-between py-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9b8050]">{member.role}</p>
                <h3 className="mt-4 text-3xl leading-tight">{member.name}</h3>
                <p className="mt-5 text-sm leading-7 text-[#606b66]">{member.bio}</p>
              </div>
              <p className="mt-8 text-xs uppercase tracking-[0.15em] text-[#183f35]">São Paulo · Brasil</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default Team;
