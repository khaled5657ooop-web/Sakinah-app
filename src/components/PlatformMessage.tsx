import React from 'react';
import { IslamicStar } from './IslamicMotifs';
import { Heart, Sparkles, ShieldCheck } from 'lucide-react';
import sanctuaryImg from '../assets/images/islamic_sanctuary_ambiance_1794522585001.jpg';

export const PlatformMessage: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="relative rounded-3xl bg-gradient-to-br from-[#032018] via-[#021812] to-[#01140e] border border-[#c5a059]/30 p-8 sm:p-14 lg:p-16 overflow-hidden shadow-2xl">
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#dfbd69_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Visual Showcase: Sanctuary Ambiance Image */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden border border-[#c5a059]/30 shadow-2xl group">
              <img
                src={sanctuaryImg}
                alt="خلوة وسكينة لقراءة القرآن وتدبره"
                loading="lazy"
                className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#021812] via-transparent to-transparent opacity-80" />
              
              {/* Overlay Badge */}
              <div className="absolute bottom-4 inset-x-4 p-4 rounded-xl bg-[#021812]/90 backdrop-blur-md border border-[#c5a059]/30 text-center">
                <span className="text-xs font-['Cinzel',serif] uppercase tracking-widest text-[#dfbd69] block">
                  SANCTUARY OF PEACE
                </span>
                <span className="text-sm font-['Amiri',serif] text-[#fbf9f5] mt-1 block">
                  خلوة روحية تنأى بك عن صخب الحياة
                </span>
              </div>
            </div>
          </div>

          {/* Text Message Content */}
          <div className="lg:col-span-7 order-1 lg:order-2 text-right">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#c5a059] font-['Cinzel',serif] mb-3">
              <IslamicStar size={12} className="text-[#dfbd69]" />
              <span>THE SAKINAH VISION</span>
            </div>

            {/* Requested Core Message Display */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] leading-tight mb-4">
              "اجعل من وقتك لحظة تقترب فيها من الله."
            </h2>

            <div className="h-[2px] w-24 bg-gradient-to-l from-[#dfbd69] to-transparent my-6" />

            <p className="text-base sm:text-lg text-[#dcd4c7] font-['Amiri',serif] leading-relaxed mb-6">
              أُسست منصة <span className="text-[#dfbd69] font-bold">سَكِينَة</span> لتكون واحتك الهادئة في زمن التسارع، وملاذك المطمئن حين تتزاحم المشاغل. نهدف إلى تقريب الناس من معين القرآن العذب، وحلاوة الذكر والدعاء، وهدي السنة النبوية الشريفة.. مجانًا بالكامل وابتغاء وجه الله الكريم.
            </p>

            {/* Three Pillars of Sakinah */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#c5a059]/15">
              <div className="p-4 rounded-xl bg-[#064e3b]/20 border border-[#c5a059]/15 text-center sm:text-right">
                <ShieldCheck className="w-5 h-5 text-[#dfbd69] mb-2 mx-auto sm:mx-0" />
                <h4 className="text-sm font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">نصوص موثقة</h4>
                <p className="text-xs text-[#b8ad9c] font-['Amiri',serif] mt-1">من المصحف الشريف وأمهات كتب الحديث</p>
              </div>

              <div className="p-4 rounded-xl bg-[#064e3b]/20 border border-[#c5a059]/15 text-center sm:text-right">
                <Heart className="w-5 h-5 text-[#dfbd69] mb-2 mx-auto sm:mx-0" />
                <h4 className="text-sm font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">مجانية خالصة</h4>
                <p className="text-xs text-[#b8ad9c] font-['Amiri',serif] mt-1">دون اشتراكات أو إعلانات تعكر الصفو</p>
              </div>

              <div className="p-4 rounded-xl bg-[#064e3b]/20 border border-[#c5a059]/15 text-center sm:text-right">
                <Sparkles className="w-5 h-5 text-[#dfbd69] mb-2 mx-auto sm:mx-0" />
                <h4 className="text-sm font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">تصميم يبعث السكينة</h4>
                <p className="text-xs text-[#b8ad9c] font-['Amiri',serif] mt-1">جماليات إسلامية بأعلى معايير الرقي</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
