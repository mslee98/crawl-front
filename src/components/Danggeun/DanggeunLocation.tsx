import { useEffect, useMemo, useState } from "react";
import Select from "../form/Select";
import Button from "../ui/button/Button";
import DanggeunExtraSettings from "./DanggeunExtraSettings";
import { locationData } from "./locationData";

const DANGGEUN_FORM_KEY = "danggeun_form";

interface SavedForm {
  selectedSi: string;
  selectedGu: string;
  selectedDong: string;
  step: 1 | 2;
  keyword: string;
  priceMin: string;
  priceMax: string;
  categoryIds: string[];
}

function loadSavedForm(): Partial<SavedForm> | null {
  try {
    const raw = localStorage.getItem(DANGGEUN_FORM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedForm>;
    if (parsed && typeof parsed.step === "number" && [1, 2].includes(parsed.step)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveForm(data: SavedForm) {
  try {
    localStorage.setItem(DANGGEUN_FORM_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/**
 * 시·구·동 3단계 연동 셀렉트.
 * 시작하기 클릭 후 메인 뷰에서 사용.
 * 새로고침 시 localStorage에 저장된 양식을 복원합니다.
 */
export default function DanggeunLocation() {
  const [selectedSi, setSelectedSi] = useState(() => loadSavedForm()?.selectedSi ?? "");
  const [selectedGu, setSelectedGu] = useState(() => loadSavedForm()?.selectedGu ?? "");
  const [selectedDong, setSelectedDong] = useState(() => loadSavedForm()?.selectedDong ?? "");
  const [step, setStep] = useState<1 | 2>(() => (loadSavedForm()?.step === 2 ? 2 : 1));
  const [keyword, setKeyword] = useState(() => loadSavedForm()?.keyword ?? "");
  const [priceMin, setPriceMin] = useState<string>(() => loadSavedForm()?.priceMin ?? "");
  const [priceMax, setPriceMax] = useState<string>(() => loadSavedForm()?.priceMax ?? "");
  const [categoryIds, setCategoryIds] = useState<string[]>(() => loadSavedForm()?.categoryIds ?? []);

  useEffect(() => {
    saveForm({
      selectedSi,
      selectedGu,
      selectedDong,
      step,
      keyword,
      priceMin,
      priceMax,
      categoryIds,
    });
  }, [selectedSi, selectedGu, selectedDong, step, keyword, priceMin, priceMax, categoryIds]);

  const siOptions = useMemo(
    () => locationData.map((s) => ({ value: s.value, label: s.label })),
    []
  );

  const guOptions = useMemo(() => {
    if (!selectedSi) return [];
    const si = locationData.find((s) => s.value === selectedSi);
    return si?.gu.map((g) => ({ value: g.value, label: g.label })) ?? [];
  }, [selectedSi]);

  const dongOptions = useMemo(() => {
    if (!selectedSi || !selectedGu) return [];
    const si = locationData.find((s) => s.value === selectedSi);
    const gu = si?.gu.find((g) => g.value === selectedGu);
    return gu?.dong ?? [];
  }, [selectedSi, selectedGu]);

  const handleSiChange = (value: string) => {
    setSelectedSi(value);
    setSelectedGu("");
    setSelectedDong("");
  };

  const handleGuChange = (value: string) => {
    setSelectedGu(value);
    setSelectedDong("");
  };

  return (
    <div className="flex flex-1 flex-col items-center">
      {step === 1 ? (
        <>
          <div className="flex flex-1 flex-col items-center">
            <h3 className="text-center mb-6 text-xl font-semibold text-gray-800 dark:text-white/90 lg:mb-8 lg:text-2xl leading-relaxed">
              빠른 서비스 제공을 위해{" "}
              <span className="text-[#4660FF] font-bold">원하는 지역을 선택</span>하세요!
            </h3>
            <div className="mb-6 text-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                지역 선택
              </h3>
              <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                시·구·동 순서로 선택하세요.
              </p>
            </div>

            <div className="flex w-full max-w-sm flex-col items-center gap-6">
              <div className="w-full">
                <label className="mb-3 block text-base font-medium text-gray-700 dark:text-gray-300">
                  시·도
                </label>
                <Select
                  options={siOptions}
                  placeholder="시·도 선택"
                  value={selectedSi}
                  onChange={handleSiChange}
                />
              </div>
              <div className="w-full">
                <label className="mb-3 block text-base font-medium text-gray-700 dark:text-gray-300">
                  구·군
                </label>
                <Select
                  options={guOptions}
                  placeholder="구·군 선택"
                  value={selectedGu}
                  onChange={handleGuChange}
                  defaultValue=""
                />
              </div>
              <div className="w-full">
                <label className="mb-3 block text-base font-medium text-gray-700 dark:text-gray-300">
                  동
                </label>
                <Select
                  options={dongOptions}
                  placeholder="동 선택"
                  value={selectedDong}
                  onChange={setSelectedDong}
                  defaultValue=""
                />
              </div>
            </div>

            {(selectedSi || selectedGu || selectedDong) && (
              <p className="mt-6 text-center text-base text-gray-600 dark:text-gray-400">
                선택:{" "}
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {siOptions.find((o) => o.value === selectedSi)?.label}
                  {selectedGu && ` > ${guOptions.find((o) => o.value === selectedGu)?.label}`}
                  {selectedDong && ` > ${dongOptions.find((o) => o.value === selectedDong)?.label}`}
                </span>
              </p>
            )}
          </div>

          <Button
            variant="primary"
            className="mt-8 w-full"
            onClick={() => setStep(2)}
          >
            다음으로
          </Button>
        </>
      ) : (
        <>
          <DanggeunExtraSettings
            locationSummary={
              selectedSi || selectedGu || selectedDong
                ? [
                    siOptions.find((o) => o.value === selectedSi)?.label,
                    selectedGu ? guOptions.find((o) => o.value === selectedGu)?.label : null,
                    selectedDong ? dongOptions.find((o) => o.value === selectedDong)?.label : null,
                  ]
                    .filter(Boolean)
                    .join(" > ")
                : undefined
            }
            keyword={keyword}
            onKeywordChange={setKeyword}
            priceMin={priceMin}
            onPriceMinChange={setPriceMin}
            priceMax={priceMax}
            onPriceMaxChange={setPriceMax}
            categoryIds={categoryIds}
            onCategoryIdsChange={setCategoryIds}
          />
          <Button
            variant="outline"
            className="mt-8 w-full"
            onClick={() => setStep(1)}
          >
            이전
          </Button>
        </>
      )}
    </div>
  );
}
