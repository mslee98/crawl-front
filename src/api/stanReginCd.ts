/**
 * 공공데이터포털 행정표준코드_법정동코드 API
 * @see https://www.data.go.kr/data/15077871/openapi.do
 * 서비스URL: http://apis.data.go.kr/1741000/StanReginCd
 * 요청주소: http://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList
 */
const BASE = "http://apis.data.go.kr/1741000/StanReginCd";
const LIST_PATH = "/getStanReginCdList";

const SIDO_CACHE_KEY = "stanReginCd_sidoList";
const SIDO_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

let cachedSidoList: { value: string; label: string }[] | null = null;
const sggCache = new Map<string, { value: string; label: string }[]>();
const umdCache = new Map<string, { value: string; label: string }[]>();

function getServiceKey(): string {
  return import.meta.env.VITE_STAN_REGION_SERVICE_KEY ?? "";
}

export interface StanReginItem {
  region_cd: string;
  sido_cd: string;
  sgg_cd: string;
  umd_cd: string;
  ri_cd?: string;
  locatadd_nm: string;
  locathigh_cd: string;
  locallow_nm?: string;
}

function ensureArray<T>(v: T | T[] | undefined): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

export interface FetchListParams {
  pageNo?: number;
  numOfRows?: number;
  locatadd_nm?: string;
}

/**
 * 법정동코드 목록 조회
 * - locatadd_nm 없음: 전체 중 시도(sgg_cd=000, umd_cd=000) 등 조회
 * - locatadd_nm="서울특별시": 해당 시도 하위 시군구/동 조회
 */
export async function fetchStanReginCdList(
  params: FetchListParams = {}
): Promise<StanReginItem[]> {
  const key = getServiceKey();
  if (!key) {
    throw new Error("VITE_STAN_REGION_SERVICE_KEY를 .env에 설정하세요.");
  }

  // 공공데이터포털: ServiceKey는 1회만 인코딩. 이미 %가 있으면 인코딩키이므로 그대로 사용.
  // 401 나면: 이 API(법정동코드) 상세페이지에서 '활용신청' 후 받은 인증키인지 확인.
  const keyEnc = key.includes("%") ? key : encodeURIComponent(key);
  const search = new URLSearchParams({
    type: "json",
    pageNo: String(params.pageNo ?? 1),
    numOfRows: String(params.numOfRows ?? 1000),
  });
  if (params.locatadd_nm != null && params.locatadd_nm !== "") {
    search.set("locatadd_nm", params.locatadd_nm);
  }
  const url = `${BASE}${LIST_PATH}?ServiceKey=${keyEnc}&${search.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`행정표준코드 API 오류: ${res.status}`);
  }

  // 실제 응답: { StanReginCd: [ { head: [...] }, { row: [ {...}, ... ] } ] }
  const data = (await res.json()) as {
    StanReginCd?: Array<{ head?: unknown[]; row?: StanReginItem | StanReginItem[] }>;
  };

  const list = data.StanReginCd;
  if (!Array.isArray(list)) return [];

  const headBlock = list.find((x) => "head" in x && Array.isArray(x.head));
  const resultInfo = headBlock?.head?.find((h) => h != null && typeof h === "object" && "RESULT" in h) as
    | { RESULT?: { resultCode?: string; resultMsg?: string } }
    | undefined;
  const resultCode = resultInfo?.RESULT?.resultCode;
  if (resultCode && resultCode !== "00" && resultCode !== "0" && !resultCode.startsWith("INFO")) {
    throw new Error(`행정표준코드 API: ${resultInfo?.RESULT?.resultMsg ?? resultCode}`);
  }

  const rowBlock = list.find((x) => "row" in x && x.row != null);
  return ensureArray(rowBlock?.row ?? []);
}

/**
 * 시·도 목록 (최상위: sgg_cd=000, umd_cd=000)
 * 메모리 + localStorage 캐시로 두 번째부터 즉시 반환.
 */
export async function fetchSidoList(): Promise<{ value: string; label: string }[]> {
  if (cachedSidoList != null) return cachedSidoList;

  try {
    const raw = localStorage.getItem(SIDO_CACHE_KEY);
    if (raw) {
      const { at, data } = JSON.parse(raw) as { at: number; data: { value: string; label: string }[] };
      if (Date.now() - at < SIDO_CACHE_TTL_MS && Array.isArray(data) && data.length > 0) {
        cachedSidoList = data;
        return data;
      }
    }
  } catch {
    // ignore
  }

  const seen = new Set<string>();
  const result: { value: string; label: string }[] = [];
  const perPage = 1000;
  let pageNo = 1;

  for (;;) {
    const list = await fetchStanReginCdList({ pageNo, numOfRows: perPage });
    const sidoRows = list.filter((r) => (r.sgg_cd ?? "") === "000" && (r.umd_cd ?? "") === "000");
    for (const row of sidoRows) {
      const code = (row.sido_cd ?? row.region_cd?.slice(0, 2) ?? "").trim();
      if (!code || seen.has(code)) continue;
      seen.add(code);
      result.push({ value: code, label: (row.locatadd_nm || row.locallow_nm || code).trim() });
    }
    if (list.length < perPage) break;
    pageNo += 1;
  }

  const sorted = result.sort((a, b) => a.label.localeCompare(b.label));
  cachedSidoList = sorted;
  try {
    localStorage.setItem(SIDO_CACHE_KEY, JSON.stringify({ at: Date.now(), data: sorted }));
  } catch {
    // ignore
  }
  return sorted;
}

/**
 * 시·군·구 목록 (해당 시도 하위, umd_cd=000인 행만). 시도별 메모리 캐시.
 */
export async function fetchSggList(sidoCd: string, sidoNm: string): Promise<{ value: string; label: string }[]> {
  const cacheKey = `sgg_${sidoCd}`;
  const hit = sggCache.get(cacheKey);
  if (hit) return hit;

  const list = await fetchStanReginCdList({ locatadd_nm: sidoNm, numOfRows: 1000 });
  const seen = new Set<string>();
  const result: { value: string; label: string }[] = [];
  for (const row of list) {
    if (row.sido_cd !== sidoCd) continue;
    if (row.umd_cd !== "000" || row.sgg_cd === "000") continue;
    const code = row.sgg_cd ?? row.region_cd.slice(2, 5);
    if (seen.has(code)) continue;
    seen.add(code);
    result.push({ value: code, label: row.locatadd_nm || row.locallow_nm || code });
  }
  const sorted = result.sort((a, b) => a.label.localeCompare(b.label));
  sggCache.set(cacheKey, sorted);
  return sorted;
}

const UMD_MAX_PAGES = 5;
const UMD_PAGE_SIZE = 5000;

/**
 * 읍·면·동 목록 (해당 시도+시군구 하위). (시도,구)별 메모리 캐시. 페이지 크기·최대 페이지 제한으로 요청 수 축소.
 */
export async function fetchUmdList(
  sidoCd: string,
  sggCd: string,
  sidoNm: string,
  _sggNm: string
): Promise<{ value: string; label: string }[]> {
  const cacheKey = `umd_${sidoCd}_${sggCd}`;
  const hit = umdCache.get(cacheKey);
  if (hit) return hit;

  const seen = new Set<string>();
  const result: { value: string; label: string }[] = [];
  let pageNo = 1;

  for (let i = 0; i < UMD_MAX_PAGES; i++) {
    const list = await fetchStanReginCdList({
      locatadd_nm: sidoNm,
      pageNo,
      numOfRows: UMD_PAGE_SIZE,
    });
    for (const row of list) {
      if (row.sido_cd !== sidoCd || row.sgg_cd !== sggCd) continue;
      if ((row.umd_cd ?? "") === "000") continue;
      const key = row.region_cd ?? "";
      if (seen.has(key)) continue;
      seen.add(key);
      const label = (row.locallow_nm || row.locatadd_nm || row.umd_cd || "").trim();
      result.push({ value: key, label: label || key });
    }
    if (list.length < UMD_PAGE_SIZE) break;
    pageNo += 1;
  }

  const sorted = result.sort((a, b) => a.label.localeCompare(b.label));
  umdCache.set(cacheKey, sorted);
  return sorted;
}
