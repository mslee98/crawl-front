/**
 * 시·구·동 계층 데이터 (샘플).
 * 필요 시 공공데이터 API로 교체 가능.
 */
export interface Dong {
  value: string;
  label: string;
}

export interface Gu {
  value: string;
  label: string;
  dong: Dong[];
}

export interface Si {
  value: string;
  label: string;
  gu: Gu[];
}

export const locationData: Si[] = [
  {
    value: "seoul",
    label: "서울특별시",
    gu: [
      {
        value: "gangnam",
        label: "강남구",
        dong: [
          { value: "gaepo-1", label: "개포1동" },
          { value: "gaepo-2", label: "개포2동" },
          { value: "gaepo-3", label: "개포3동" },
          { value: "gaepo-4", label: "개포4동" },
          { value: "sinsa", label: "신사동" },
          { value: "nonhyeon", label: "논현동" },
          { value: "cheongdam", label: "청담동" },
          { value: "samseong", label: "삼성동" },
          { value: "daechi", label: "대치동" },
        ],
      },
      {
        value: "seocho",
        label: "서초구",
        dong: [
          { value: "seocho-1", label: "서초1동" },
          { value: "seocho-2", label: "서초2동" },
          { value: "seocho-3", label: "서초3동" },
          { value: "seocho-4", label: "서초4동" },
          { value: "jamwon", label: "잠원동" },
          { value: "banpo", label: "반포동" },
          { value: "bangbae", label: "방배동" },
        ],
      },
      {
        value: "songpa",
        label: "송파구",
        dong: [
          { value: "jangji", label: "장지동" },
          { value: "munjeong", label: "문정동" },
          { value: "jamsil", label: "잠실동" },
          { value: "garak", label: "가락동" },
          { value: "ogeum", label: "오금동" },
        ],
      },
    ],
  },
  {
    value: "daejeon",
    label: "대전광역시",
    gu: [
      {
        value: "seo",
        label: "서구",
        dong: [
          { value: "gwanjeo", label: "관저동" },
          { value: "nae-dong", label: "내동" },
          { value: "gap-dong", label: "갑동" },
          { value: "dujeong", label: "둔산동" },
          { value: "mannyeon", label: "만년동" },
        ],
      },
      {
        value: "yuseong",
        label: "유성구",
        dong: [
          { value: "bongmyeong", label: "봉명동" },
          { value: "guseong", label: "구성동" },
          { value: "noeun", label: "노은동" },
          { value: "jedeok", label: "지족동" },
          { value: "eoeun", label: "어은동" },
        ],
      },
      {
        value: "jung",
        label: "중구",
        dong: [
          { value: "daesa", label: "대사동" },
          { value: "busan", label: "부사동" },
          { value: "munhwa", label: "문화동" },
          { value: "sannae", label: "산네동" },
        ],
      },
    ],
  },
  {
    value: "busan",
    label: "부산광역시",
    gu: [
      {
        value: "haeundae",
        label: "해운대구",
        dong: [
          { value: "woo-1", label: "우1동" },
          { value: "woo-2", label: "우2동" },
          { value: "jung-1", label: "중1동" },
          { value: "jung-2", label: "중2동" },
          { value: "jwa", label: "좌동" },
        ],
      },
      {
        value: "suyeong",
        label: "수영구",
        dong: [
          { value: "namcheong", label: "남천동" },
          { value: "suyeong", label: "수영동" },
          { value: "mangmi", label: "망미동" },
          { value: "gwangalli", label: "광안동" },
        ],
      },
    ],
  },
  {
    value: "incheon",
    label: "인천광역시",
    gu: [
      {
        value: "nam",
        label: "남동구",
        dong: [
          { value: "gulpae", label: "구래동" },
          { value: "nonhyeon", label: "논현동" },
          { value: "dangsu", label: "당수동" },
          { value: "mannak", label: "만수동" },
        ],
      },
      {
        value: "yeonsu",
        label: "연수구",
        dong: [
          { value: "dongchun", label: "동춘동" },
          { value: "songdo", label: "송도동" },
          { value: "cheongna", label: "청라동" },
          { value: "yeonsu", label: "연수동" },
        ],
      },
    ],
  },
];
