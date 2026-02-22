import { useEffect, useState } from "react";
import { fetchSidoList, fetchSggList, fetchUmdList } from "../api/stanReginCd";

export interface AddressOption {
  value: string;
  label: string;
}

/**
 * 공공데이터 행정표준코드(법정동) API 연동 훅
 * 시도 → 시군구 → 읍면동 단계별 옵션 반환
 */
export function useStanReginCd(selectedSi: string, selectedGu: string): {
  siOptions: AddressOption[];
  guOptions: AddressOption[];
  dongOptions: AddressOption[];
  loadingSi: boolean;
  loadingGu: boolean;
  loadingDong: boolean;
  error: string | null;
} {
  const [siOptions, setSiOptions] = useState<AddressOption[]>([]);
  const [guOptions, setGuOptions] = useState<AddressOption[]>([]);
  const [dongOptions, setDongOptions] = useState<AddressOption[]>([]);
  const [loadingSi, setLoadingSi] = useState(true);
  const [loadingGu, setLoadingGu] = useState(false);
  const [loadingDong, setLoadingDong] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSiLabel = siOptions.find((o) => o.value === selectedSi)?.label ?? "";
  const selectedGuLabel = guOptions.find((o) => o.value === selectedGu)?.label ?? "";

  useEffect(() => {
    setError(null);
    setLoadingSi(true);
    fetchSidoList()
      .then(setSiOptions)
      .catch((e) => setError(e instanceof Error ? e.message : "시도 목록 조회 실패"))
      .finally(() => setLoadingSi(false));
  }, []);

  useEffect(() => {
    if (!selectedSi || !selectedSiLabel) {
      setGuOptions([]);
      setDongOptions([]);
      return;
    }
    setLoadingGu(true);
    setGuOptions([]);
    setDongOptions([]);
    fetchSggList(selectedSi, selectedSiLabel)
      .then(setGuOptions)
      .catch((e) => setError(e instanceof Error ? e.message : "시군구 목록 조회 실패"))
      .finally(() => setLoadingGu(false));
  }, [selectedSi, selectedSiLabel]);

  useEffect(() => {
    if (!selectedGu || !selectedSiLabel || !selectedGuLabel) {
      setDongOptions([]);
      return;
    }
    setLoadingDong(true);
    setDongOptions([]);
    fetchUmdList(selectedSi, selectedGu, selectedSiLabel, selectedGuLabel)
      .then(setDongOptions)
      .catch((e) => setError(e instanceof Error ? e.message : "읍면동 목록 조회 실패"))
      .finally(() => setLoadingDong(false));
  }, [selectedSi, selectedGu, selectedSiLabel, selectedGuLabel]);

  return {
    siOptions,
    guOptions,
    dongOptions,
    loadingSi,
    loadingGu,
    loadingDong,
    error,
  };
}
