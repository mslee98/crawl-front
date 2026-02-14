import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { categoryOptions } from "./categoryData";

interface DanggeunExtraSettingsProps {
  /** 선택한 지역 요약 (예: "서울특별시 > 강남구 > 신사동") */
  locationSummary?: string;
  keyword: string;
  onKeywordChange: (value: string) => void;
  priceMin: string;
  onPriceMinChange: (value: string) => void;
  priceMax: string;
  onPriceMaxChange: (value: string) => void;
  categoryIds: string[];
  onCategoryIdsChange: (ids: string[]) => void;
}

/**
 * 키워드 / 가격 / 카테고리 기타 설정 폼.
 * 지역 선택 다음 단계에서 사용.
 */
export default function DanggeunExtraSettings({
  locationSummary,
  keyword,
  onKeywordChange,
  priceMin,
  onPriceMinChange,
  priceMax,
  onPriceMaxChange,
  categoryIds,
  onCategoryIdsChange,
}: DanggeunExtraSettingsProps) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <h3 className="text-center mb-6 text-xl font-semibold text-gray-800 dark:text-white/90 lg:mb-8 lg:text-2xl leading-relaxed">
        <span className="text-[#4660FF] font-bold">기타 항목들을</span> 설정하세요
      </h3>
      {locationSummary && (
        <p className="mb-6 text-center text-base text-gray-600 dark:text-gray-400">
          선택한 지역:{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {locationSummary}
          </span>
        </p>
      )}

      <div className="flex w-full max-w-xl flex-col gap-10">
        {/* 키워드 */}
        <div className="flex flex-col gap-3">
          <label className="text-base font-medium text-gray-700 dark:text-gray-300">
            키워드
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="whitespace-nowrap">키워드를 입력하지 않아도 좋아요!</span>{" "}
            <span className="whitespace-nowrap">하지만 주력 상품이 있다면 키워드를 입력해주세요.</span>{" "}
            <span className="whitespace-nowrap">(예: &quot;애플&quot;, &quot;아이폰&quot; 등)</span>
          </p>
          <Input
            type="text"
            placeholder="검색 키워드 입력 (빈값 가능)"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
          />
        </div>

        {/* 가격 */}
        <div className="flex flex-col gap-3">
          <label className="text-base font-medium text-gray-700 dark:text-gray-300">
            가격 (원)
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            0원으로 설정하면 홍보 글이나 보세 옷처럼 브랜드 없는 제품들도 검색돼요. (빈값 가능)
          </p>
          <div className="flex gap-4">
            <Input
              type="number"
              placeholder="최소 가격"
              min="0"
              value={priceMin}
              onChange={(e) => onPriceMinChange(e.target.value)}
            />
            <Input
              type="number"
              placeholder="최대 가격"
              min="0"
              value={priceMax}
              onChange={(e) => onPriceMaxChange(e.target.value)}
            />
          </div>
        </div>

        {/* 카테고리 - 체크박스 */}
        <div className="flex flex-col gap-3">
          <label className="text-base font-medium text-gray-700 dark:text-gray-300">
            카테고리
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            원하는 카테고리를 선택하세요. (선택 안 해도 됨)
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            {categoryOptions
              .filter((o) => o.value !== "")
              .map((opt) => (
                <Checkbox
                  key={opt.value}
                  id={`category-${opt.value}`}
                  label={opt.label}
                  checked={categoryIds.includes(opt.value)}
                  onChange={(checked) => {
                    onCategoryIdsChange(
                      checked
                        ? [...categoryIds, opt.value]
                        : categoryIds.filter((id) => id !== opt.value)
                    );
                  }}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
