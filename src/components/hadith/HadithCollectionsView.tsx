import React from 'react';
import { HADITH_COLLECTIONS, HadithCollection } from '../../data/hadithData';
import { BookOpen, ArrowLeft, Award, ShieldCheck } from 'lucide-react';

interface HadithCollectionsViewProps {
  onSelectCollection: (collectionId: string) => void;
}

export const HadithCollectionsView: React.FC<HadithCollectionsViewProps> = ({
  onSelectCollection,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h3 className="text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
          كتب ودواوين السنة النبوية المشرفة
        </h3>
        <p className="text-xs sm:text-sm text-[#d1c7b7] font-['Amiri',serif] mt-1">
          أمهات كتب الحديث المعتمدة لدى جماهير أهل العلم، موثقة بالإسناد والتحقيق
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {HADITH_COLLECTIONS.map((col: HadithCollection) => (
          <div
            key={col.id}
            className="group relative rounded-2xl bg-gradient-to-b from-[#03241b] via-[#021c15] to-[#01140e] border border-[#c5a059]/25 hover:border-[#dfbd69]/70 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#c5a059]/10"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#c5a059]/15">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#064e3b]/50 border border-[#c5a059]/30 flex items-center justify-center text-[#dfbd69] group-hover:bg-[#064e3b] transition-colors">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] group-hover:text-[#dfbd69] transition-colors">
                      {col.name}
                    </h4>
                    <span className="text-xs text-[#a89e8f] font-['Amiri',serif]">
                      المؤلف: {col.author} ({col.deathYear})
                    </span>
                  </div>
                </div>

                <span className="text-xs px-2.5 py-1 rounded-full bg-[#064e3b]/30 border border-[#c5a059]/20 text-[#dfbd69] font-['Amiri',serif]">
                  {col.hadithCount}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm font-['Amiri',serif] text-[#d4ccbf] leading-relaxed mb-4">
                {col.description}
              </p>

              {/* Importance / Feature */}
              <div className="p-3 rounded-xl bg-[#021812] border border-[#c5a059]/15 text-xs text-[#c5a059] font-['Amiri',serif] mb-6 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#dfbd69] shrink-0 mt-0.5" />
                <span>{col.importance}</span>
              </div>
            </div>

            {/* Browse Button */}
            <button
              onClick={() => onSelectCollection(col.id)}
              className="w-full py-2.5 px-4 rounded-xl font-['Amiri',serif] text-xs font-bold text-[#f5efe6] bg-[#064e3b]/40 hover:bg-[#dfbd69] hover:text-[#021812] border border-[#c5a059]/30 hover:border-[#dfbd69] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group/btn"
            >
              <span>تصفح أحاديث {col.name}</span>
              <ArrowLeft className="w-3.5 h-3.5 text-[#dfbd69] group-hover/btn:text-[#021812] group-hover/btn:-translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
