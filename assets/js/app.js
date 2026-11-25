/* ============================================================
   마이쿡 — 화면 구성과 추천 로직
   ============================================================ */

const app = document.getElementById('app');
const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

/* ---------------------------------------------- 유틸 */
const byId = (id) => RECIPES.find((r) => r.id === id);
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function ingPreview(r, n = 4) {
  return r.ingredients.slice(0, n).map((i) => i.n).join(' · ') +
    (r.ingredients.length > n ? ' 외' : '');
}

function traitChips(r, max = 3) {
  return r.traits
    .slice(0, max)
    .map((t, i) => `<span class="chip ${i === 0 ? 'accent' : ''}">${TRAIT_LABEL[t]}</span>`)
    .join('');
}

function themeNames(r) {
  return r.themes.map((t) => THEMES[t].name).join(' · ');
}

/* ---------------------------------------------- 오늘의 상황 판단 */
function todayContext(date = new Date()) {
  const w = date.getDay();
  const label = `${date.getMonth() + 1}월 ${date.getDate()}일 ${DAY_KO[w]}요일`;

  if (w === 6) {
    return {
      kind: 'sat',
      dateLabel: label,
      headline: '토요일 아침은 <em>온 가족이 함께</em>',
      status: '주말 · 가족 식사',
      note: '토요일 아침은 네 식구가 함께 먹을 수 있는 시간입니다. 든든한 한 상을 중심으로 하루를 구성했습니다.',
      chips: ['주말', '가족 네 명이 함께', '든든한 한 끼'],
      plan: [
        { slot: 'familyAM', title: '토요일 아침', who: '가족 네 명', max: 40, why: '네 식구가 함께 먹을 수 있는 시간이라 든든한 메뉴로 골랐습니다.' },
        { slot: 'side', title: '곁들임 반찬', who: '함께', max: 15, why: '한 상에 올릴 반찬을 하나만 더합니다.' },
        { slot: 'jeomjeo', title: '점심 · 간단히', who: '각자', max: 20, why: '아침을 든든히 먹었으니 점심은 가볍고 빠르게 준비합니다.' },
        { slot: 'late', title: '저녁', who: '각자 일정에 맞춰', max: 25, why: '저녁은 각자 시간이 달라 간단히 차릴 수 있는 메뉴로 골랐습니다.' },
        { slot: 'snack', title: '간식', who: '아이들', max: 30, why: '주말 오후에 아이들과 함께 만들어 먹기 좋은 간식입니다.' }
      ]
    };
  }

  if (w === 0) {
    return {
      kind: 'sun',
      dateLabel: label,
      headline: '일요일은 <em>아침과 저녁</em>을 함께',
      status: '주말 · 가족 식사 2회',
      note: '일요일은 아침과 저녁 모두 네 식구가 함께 먹을 수 있는 날입니다. 두 끼 모두 든든한 메뉴로 구성했습니다.',
      chips: ['주말', '아침·저녁 함께', '든든한 한 끼'],
      plan: [
        { slot: 'familyAM', title: '일요일 아침', who: '가족 네 명', max: 40, why: '아침부터 함께 먹을 수 있는 날이라 국이 있는 든든한 상으로 골랐습니다.' },
        { slot: 'side', title: '곁들임 반찬', who: '함께', max: 15, why: '아침상에 올릴 간단한 반찬입니다.' },
        { slot: 'family', title: '일요일 저녁', who: '가족 네 명', max: 40, why: '한 주를 마무리하는 저녁이라 양이 넉넉한 메뉴로 골랐습니다.' },
        { slot: 'jeomjeo', title: '점심 · 간단히', who: '각자', max: 20, why: '아침과 저녁이 든든하므로 점심은 가볍게 준비합니다.' },
        { slot: 'snack', title: '간식', who: '아이들', max: 30, why: '주말 오후에 아이들과 함께 만들어 먹기 좋은 간식입니다.' }
      ]
    };
  }

  const busy = w === 1 || w === 3; // 월·수 = 엄마 출근일
  return {
    kind: busy ? 'busy' : 'weekday',
    dateLabel: label,
    headline: busy
      ? '오늘은 <em>가장 짧게</em> 차리는 날'
      : '각자의 시간에 <em>한 끼씩</em>',
    status: busy ? '평일 · 출근하는 날' : '평일 · 조금 여유 있는 날',
    note: busy
      ? '엄마가 출근하는 날입니다. 준비 시간이 짧고 재료가 적은 메뉴만 골랐습니다.'
      : '가족마다 식사 시간이 다른 평일입니다. 끼니를 챙기는 것을 가장 앞에 두고 메뉴를 골랐습니다.',
    chips: busy
      ? ['평일', '엄마 출근일', '15분 이내', '적은 재료']
      : ['평일', '끼니 해결 우선', '쉬운 조리'],
    plan: busy
      ? [
          { slot: 'morning', title: '아침', who: '엄마 · 아빠', max: 7, why: '출근 전이라 불을 거의 쓰지 않거나 5분 안에 끝나는 메뉴입니다.' },
          { slot: 'jeomjeo', title: '점저', who: '아이들 · 학원 전', max: 15, why: '학원 가기 전에 빠르게 먹을 수 있도록 조리 시간이 짧은 메뉴입니다.' },
          { slot: 'late', title: '늦은 저녁', who: '아이들 · 밤 9~10시', max: 15, why: '늦은 시간이라 속이 편하고 바로 차릴 수 있는 메뉴로 골랐습니다.' },
          { slot: 'side', title: '곁들임 반찬', who: '미리 만들어 두기', max: 10, why: '한 번 만들어 두면 각자 시간에 맞춰 꺼내 먹을 수 있습니다.' }
        ]
      : [
          { slot: 'morning', title: '아침', who: '엄마 · 아빠', max: 12, why: '아침에 단백질을 챙길 수 있는 메뉴로 골랐습니다.' },
          { slot: 'jeomjeo', title: '점저', who: '아이들 · 학원 전', max: 20, why: '학원 가기 전에 먹을 수 있도록 조리가 간단한 메뉴입니다.' },
          { slot: 'late', title: '늦은 저녁', who: '아이들 · 밤 9~10시', max: 20, why: '학원에서 돌아온 뒤 먹을 메뉴입니다. 양은 넉넉하게 조절하세요.' },
          { slot: 'side', title: '곁들임 반찬', who: '미리 만들어 두기', max: 15, why: '오늘 만들어 두면 내일 식사까지 함께 쓸 수 있습니다.' }
        ]
  };
}

/* 날짜를 씨앗으로 쓰는 결정적 추천 — 같은 날엔 같은 메뉴, 날이 바뀌면 달라집니다 */
function pickForSlot(slotDef, used, seed, order) {
  let pool = RECIPES.filter(
    (r) => r.slots.includes(slotDef.slot) && r.time <= slotDef.max && !used.has(r.id)
  );
  if (!pool.length) {
    pool = RECIPES.filter((r) => r.slots.includes(slotDef.slot) && !used.has(r.id));
  }
  if (!pool.length) pool = RECIPES.filter((r) => !used.has(r.id));
  if (!pool.length) return null;

  pool.sort((a, b) => a.id.localeCompare(b.id));
  const pick = pool[(seed + order * 5) % pool.length];
  used.add(pick.id);
  return pick;
}

function buildTodayPlan(ctx, date = new Date()) {
  // 현지 날짜 기준 씨앗 — 자정에 메뉴가 바뀝니다
  const seed = date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate();
  const used = new Set();
  return ctx.plan
    .map((s, i) => ({ ...s, recipe: pickForSlot(s, used, seed, i) }))
    .filter((s) => s.recipe);
}

/* ---------------------------------------------- 홈 화면 */
function viewHome() {
  const ctx = todayContext();
  const plan = buildTodayPlan(ctx);

  const planCards = plan
    .map(
      (s) => `
      <a class="plan-card" href="#/recipe/${s.recipe.id}">
        <div class="plan-slot">
          <span class="t">${esc(s.title)}</span>
          <span class="w">${esc(s.who)}</span>
        </div>
        <h3>${esc(s.recipe.name)}</h3>
        <p class="plan-why">${esc(s.why)}</p>
        <div class="plan-meta">
          <span class="chip accent">${s.recipe.time}분</span>
          <span class="chip">${esc(s.recipe.level)}</span>
          <span class="chip">${esc(s.recipe.servings)}</span>
        </div>
        <p class="plan-ing"><b>재료</b> ${esc(ingPreview(s.recipe, 5))}</p>
      </a>`
    )
    .join('');

  const themeCards = Object.values(THEMES)
    .map((t) => {
      const n = RECIPES.filter((r) => r.themes.includes(t.id)).length;
      return `
      <a class="theme-card" href="#/theme/${t.id}">
        <div class="tc-ico">${themeIcon(t.icon)}</div>
        <h3>${esc(t.name)}</h3>
        <p>${esc(t.desc)}</p>
        <span class="tc-count">메뉴 ${n}개 보기 →</span>
      </a>`;
    })
    .join('');

  const quick = RECIPES.filter((r) => r.time <= 12)
    .sort((a, b) => a.time - b.time)
    .slice(0, 4);

  const weekend = RECIPES.filter(
    (r) => r.slots.includes('family') || r.slots.includes('familyAM')
  ).slice(0, 4);

  // 앞으로 3일치 식사 계획
  const upcoming = [1, 2, 3].map((n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    const c = todayContext(d);
    return { date: d, ctx: c, plan: buildTodayPlan(c, d) };
  });

  const upcomingCards = upcoming
    .map(
      (u) => `
      <article class="day-card">
        <div class="day-head">
          <span class="dd">${u.date.getMonth() + 1}월 ${u.date.getDate()}일 <b>${DAY_KO[u.date.getDay()]}</b></span>
          <span class="chip">${esc(u.ctx.status.replace(/^.*· /, ''))}</span>
        </div>
        <ul class="day-list">
          ${u.plan
            .slice(0, 4)
            .map(
              (p) => `<li>
                <span class="s">${esc(p.title)}</span>
                <a href="#/recipe/${p.recipe.id}">${esc(p.recipe.name)}</a>
                <span class="t">${p.recipe.time}분</span>
              </li>`
            )
            .join('')}
        </ul>
      </article>`
    )
    .join('');

  const trending = RECIPES.filter((r) => r.traits.includes('trend'));

  // 사용자가 보낸 영상에서 정리한 메뉴는 따로 모아 보여줍니다
  const mine = RECIPES.filter((r) => r.source || r.traits.indexOf('mine') > -1);

  const protein = RECIPES.filter((r) => r.traits.includes('protein') && r.time <= 20).sort(
    (a, b) => a.time - b.time
  );

  app.innerHTML = `
    <div class="view view-home">
      <section class="wrap hero">
        <div class="hero-top">
          <div>
            <span class="eyebrow">오늘의 추천</span>
            <h1>${ctx.headline}</h1>
            <p class="hero-note">${esc(ctx.note)}</p>
          </div>
          <div class="today-badge">
            <div class="d1">TODAY</div>
            <div class="d2">${esc(ctx.dateLabel)}</div>
            <div class="d3">${esc(ctx.status)}</div>
          </div>
        </div>

        <div class="plan">
          <div class="plan-head">
            <div>
              <span class="eyebrow">오늘 차릴 식사</span>
              <h2>찾아보지 않아도 오늘 메뉴는 정해져 있습니다</h2>
              <div class="plan-context">
                ${ctx.chips.map((c) => `<span class="chip olive">${esc(c)}</span>`).join('')}
              </div>
            </div>
          </div>
          <div class="plan-grid">${planCards}</div>
          <div class="plan-foot">
            <button class="btn btn-ghost print-btn" onclick="window.print()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6Z"/></svg>
              식단표 인쇄하기
            </button>
            <span class="hint">가족의 생활 패턴(엄마 출근일, 아이들 학원 일정, 주말 가족 식사)을 기준으로 매일 자동으로 바뀝니다.</span>
          </div>
        </div>

        <div class="upcoming">
          <div class="up-head">
            <div>
              <span class="eyebrow">앞으로 3일</span>
              <h3>미리 보는 식사 계획</h3>
            </div>
            <a class="link-more" href="#/shopping">이 기간 장보기 목록 →</a>
          </div>
          <div class="up-grid">${upcomingCards}</div>
        </div>
      </section>

      ${
        mine.length
          ? `<section class="wrap list-section" style="padding-top:60px">
              <div class="section-head">
                <div>
                  <span class="eyebrow">내가 보낸 것</span>
                  <h2>영상에서 정리한 내 메뉴</h2>
                  <p>보내주신 요리 영상을 레시피로 정리한 메뉴입니다.</p>
                </div>
                <a class="link-more" href="#/saved">내 메뉴 전체 보기 →</a>
              </div>
              <div class="card-grid">${mine.slice(0, 4).map(cardHTML).join('')}</div>
            </section>`
          : ''
      }

      <section class="wrap themes">
        <div class="section-head">
          <div>
            <span class="eyebrow">테마별로 찾기</span>
            <h2>무엇을 차릴지 먼저 정해보세요</h2>
          </div>
        </div>
        <div class="theme-grid">${themeCards}</div>
      </section>

      <section class="wrap list-section">
        <div class="section-head">
          <div>
            <span class="eyebrow">요즘 인기</span>
            <h2>요즘 많이 해 먹는 메뉴</h2>
            <p>짧은 영상과 집밥 기사에서 자주 보이는 메뉴 중, 재료가 적고 조리가 쉬운 것만 골랐습니다.</p>
          </div>
        </div>
        <div class="card-grid">${trending.slice(0, 6).map(cardHTML).join('')}</div>
      </section>

      <section class="wrap list-section">
        <div class="section-head">
          <div>
            <span class="eyebrow">단백질 챙기기</span>
            <h2>단백질 위주로 먹고 싶을 때</h2>
            <p>단백질이 넉넉하면서 20분 안에 차릴 수 있는 메뉴입니다.</p>
          </div>
          <a class="link-more" href="#/theme/onedish">더 보기 →</a>
        </div>
        <div class="card-grid">${protein.slice(0, 4).map(cardHTML).join('')}</div>
      </section>

      <section class="wrap list-section">
        <div class="section-head">
          <div>
            <span class="eyebrow">시간이 없을 때</span>
            <h2>12분 안에 끝나는 메뉴</h2>
            <p>재료가 적고 조리가 단순해 바쁜 날에도 부담이 없습니다.</p>
          </div>
          <a class="link-more" href="#/theme/onedish">한 끼 식사 전체 보기 →</a>
        </div>
        <div class="card-grid">${quick.map(cardHTML).join('')}</div>
      </section>

      <section class="wrap list-section">
        <div class="section-head">
          <div>
            <span class="eyebrow">주말 가족 식사</span>
            <h2>네 식구가 함께 먹는 든든한 한 끼</h2>
            <p>토요일 아침, 일요일 아침과 저녁에 올리기 좋은 메뉴입니다.</p>
          </div>
        </div>
        <div class="card-grid">${weekend.map(cardHTML).join('')}</div>
      </section>
    </div>`;
}

/* ---------------------------------------------- 메뉴 그림 (지금은 쓰지 않음)
 * 오래된 태블릿에서 화면이 깨져 보여 2026년 11월에 화면에서 뺐습니다.
 * 코드는 남겨두었습니다. 다시 넣으려면 cardHTML과 viewRecipe에
 * artBlock(r, 'rc-art') / artBlock(r, 'detail-art') 를 되살리고
 * style.css에 그림 스타일을 다시 넣으면 됩니다.
 */
const ART_RULES = [
  ['drink', ['셰이크', '요거트 오트볼']],
  ['dessert', ['브라우니', '카스테라', '아이스크림', '맛탕', '감자칩', '찹쌀떡', '쿠키']],
  ['bread', ['토스트', '샌드위치', '팬케이크', '빵']],
  ['egg', ['달걀찜', '스크램블', '계란말이', '달걀밥', '계란조림', '달걀 덮밥']],
  ['soup', ['국', '탕', '찌개', '나베', '전골', '국밥']],
  ['noodle', ['국수', '우동', '파스타', '잡채', '라면', '떡볶이']],
  ['rice', ['밥', '덮밥', '비빔밥', '주먹밥', '카레', '솥밥']],
  ['grill', ['불고기', '제육', '구이', '강정', '전']],
  ['salad', ['무침', '생채', '나물', '오이', '샐러드']],
  ['stirfry', ['볶음', '볶기', '조림', '장조림']]
];

function dishArt(r) {
  for (const [kind, keys] of ART_RULES) {
    if (keys.some((k) => r.name.indexOf(k) > -1)) return kind;
  }
  if (r.themes.indexOf('snack') > -1) return 'dessert';
  if (r.themes.indexOf('morning') > -1) return 'egg';
  if (r.themes.indexOf('side') > -1) return 'stirfry';
  return 'rice';
}

const ART_TINT = {
  rice: 1,
  soup: 2,
  noodle: 3,
  stirfry: 4,
  grill: 2,
  egg: 3,
  bread: 1,
  salad: 4,
  dessert: 3,
  drink: 1
};

function artSVG(kind) {
  const o =
    'viewBox="0 0 120 80" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"';
  // 김은 부드러운 곡선으로 그려야 작게 봐도 자연스럽습니다
  const steam =
    '<path d="M50 24c-5-5 5-8 0-14" opacity=".45"/><path d="M60 22c-5-5 5-8 0-14" opacity=".45"/><path d="M70 24c-5-5 5-8 0-14" opacity=".45"/>';
  const bowl = (y) =>
    `<path d="M26 ${y}h68a34 34 0 0 1-68 0Z"/><path d="M20 ${y}h80"/>`;
  const art = {
    // 밥 — 그릇 위로 봉긋하게 담긴 모양
    rice: `${steam}${bowl(44)}<path d="M40 44a20 13 0 0 1 40 0"/><path d="M50 40h4M62 38h5M56 44h8" opacity=".45"/>`,
    // 국 — 그릇과 숟가락
    soup: `${steam}${bowl(44)}<path d="M44 52c5 4 9 4 14 0s9-4 14 0" opacity=".5"/><path d="M96 34c5 0 7 4 5 8l-4 8" stroke-width="2"/>`,
    // 면 — 그릇에 담긴 면과 젓가락
    noodle: `${steam}${bowl(44)}<path d="M40 44c0-8 5-13 10-13s10 5 10 13M60 44c0-8 5-13 10-13s10 5 10 13" opacity=".7"/><path d="M88 22 70 46" stroke-width="2.3"/><path d="M94 26 76 50" stroke-width="2.3"/>`,
    // 볶음·조림 — 손잡이 달린 팬
    stirfry: `<path d="M20 38h58a29 29 0 0 1-58 0Z"/><path d="M78 40h24" stroke-width="2.3"/><circle cx="38" cy="46" r="3.2" opacity=".6"/><circle cx="50" cy="50" r="3.2" opacity=".6"/><circle cx="62" cy="46" r="3.2" opacity=".6"/><path d="M36 26c-4-4 4-6 0-11M52 24c-4-4 4-6 0-11" opacity=".4"/>`,
    // 구이 — 접시에 올린 고기
    grill: `<ellipse cx="60" cy="48" rx="36" ry="15"/><path d="M46 44c3-7 12-10 20-7s11 10 6 14-20 4-26-1Z" opacity=".9"/><path d="M52 44c4-3 9-4 13-2" opacity=".4"/>`,
    // 달걀 — 프라이
    egg: `<path d="M34 42c-6-12 6-22 18-20 10 2 10 10 18 9 12-1 18 8 14 16-4 9-20 14-32 12s-14-9-18-17Z"/><circle cx="54" cy="42" r="10"/><path d="M50 38a5 5 0 0 1 5-3" opacity=".45"/>`,
    // 빵 — 식빵 한 장
    bread: `<path d="M34 32c0-9 9-14 26-14s26 5 26 14v26a5 5 0 0 1-5 5H39a5 5 0 0 1-5-5Z"/><path d="M34 36h52" opacity=".5"/><path d="M48 46h24M48 54h15" opacity=".45"/>`,
    // 나물·무침 — 그릇 위로 솟은 잎
    salad: `${bowl(46)}<path d="M50 46c-9-3-13-13-8-19 7 3 12 12 8 19Z" opacity=".9"/><path d="M62 46c-3-10 3-18 10-18 1 8-3 16-10 18Z" opacity=".9"/><path d="M74 46c0-7 6-11 11-9-1 6-5 9-11 9Z" opacity=".9"/>`,
    // 간식 — 컵에 담긴 디저트
    dessert: `<path d="M36 34h48l-5 27a6 6 0 0 1-6 5H47a6 6 0 0 1-6-5Z"/><path d="M32 34h56" opacity=".6"/><path d="M48 28c-4-5 4-7 0-12M60 26c-4-5 4-7 0-12M72 28c-4-5 4-7 0-12" opacity=".45"/>`,
    // 음료 — 빨대 꽂은 컵
    drink: `<path d="M42 26h36l-5 38a6 6 0 0 1-6 5H53a6 6 0 0 1-6-5Z"/><path d="M44 40h32" opacity=".55"/><path d="M72 18 60 30" stroke-width="2.3"/><circle cx="56" cy="52" r="2.8" opacity=".5"/><circle cx="65" cy="58" r="2.2" opacity=".5"/>`
  };
  return `<svg ${o} aria-hidden="true">${art[kind] || art.rice}</svg>`;
}

function artBlock(r, cls) {
  const kind = dishArt(r);
  return `<div class="${cls} tint-${ART_TINT[kind] || 1}">${artSVG(kind)}</div>`;
}

function cardHTML(r) {
  return `
    <a class="rc" href="#/recipe/${r.id}">
      <div class="rc-top">
        <span class="rc-theme">${esc(themeNames(r))}</span>
        <span class="rc-time">${r.time}분</span>
      </div>
      <h3>${esc(r.name)}</h3>
      <p class="rc-tag">${esc(r.tagline)}</p>
      <div class="rc-traits">${traitChips(r)}</div>
      <p class="rc-ing"><b>재료 ${r.ingredients.length}가지</b> · ${esc(ingPreview(r))}</p>
    </a>`;
}

function themeIcon(kind) {
  const common = 'width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
  if (kind === 'bowl')
    return `<svg ${common}><path d="M3 11h18a9 9 0 0 1-18 0Z"/><path d="M12 11V4"/><path d="M9 6.5c0-1.5 1.3-2.5 3-2.5s3 1 3 2.5"/></svg>`;
  if (kind === 'side')
    return `<svg ${common}><rect x="3" y="6" width="8" height="12" rx="2"/><rect x="13" y="6" width="8" height="5" rx="1.5"/><rect x="13" y="13" width="8" height="5" rx="1.5"/></svg>`;
  if (kind === 'soup')
    return `<svg ${common}><path d="M4 11h16a8 8 0 0 1-16 0Z"/><path d="M2 11h20"/><path d="M8 6c-1.2-1.2 1.2-2 0-3.4M12 5.4c-1.2-1.2 1.2-2 0-3.4M16 6c-1.2-1.2 1.2-2 0-3.4"/></svg>`;
  if (kind === 'snack')
    return `<svg ${common}><path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-5-5 4 4 0 0 1-4-4Z"/><circle cx="9" cy="10" r="1"/><circle cx="13" cy="15" r="1"/><circle cx="8" cy="15" r="1"/></svg>`;
  return `<svg ${common}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;
}

/* ---------------------------------------------- 테마 목록 */
const FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'trend', label: '요즘 인기' },
  { id: 'popular', label: '조회수 상위' },
  { id: 'quick', label: '15분 이내' },
  { id: 'protein', label: '단백질 든든' },
  { id: 'kid', label: '아이 입맛' },
  { id: 'hearty', label: '묵직한 한 끼' },
  { id: 'volume', label: '양 넉넉' },
  { id: 'onepan', label: '설거지 적음' }
];

let activeFilter = 'all';

function viewTheme(themeId) {
  const theme = THEMES[themeId];
  if (!theme) return viewNotFound();

  const render = () => {
    let list = RECIPES.filter((r) => r.themes.includes(themeId));
    if (activeFilter !== 'all') list = list.filter((r) => r.traits.includes(activeFilter));
    list.sort((a, b) => a.time - b.time);

    const grid = document.getElementById('themeGrid');
    grid.innerHTML = list.length
      ? list.map(cardHTML).join('')
      : `<div class="empty" style="grid-column:1/-1"><h3>조건에 맞는 메뉴가 없습니다</h3><p>다른 조건을 선택해 보세요.</p></div>`;
    document.querySelectorAll('.fbtn').forEach((b) =>
      b.classList.toggle('on', b.dataset.f === activeFilter)
    );
  };

  app.innerHTML = `
    <div class="view">
      <section class="wrap hero" style="padding-bottom:0">
        <div class="crumb"><a href="#/">오늘의 추천</a> <span>›</span> <span>${esc(theme.name)}</span></div>
        <span class="eyebrow">테마별 메뉴</span>
        <h1>${esc(theme.name)}</h1>
        <p class="hero-note">${esc(theme.desc)} · 모두 재료가 적고 조리 단계가 간단한 메뉴입니다.</p>
      </section>

      <section class="wrap list-section" style="padding-top:36px">
        <div class="filters">
          <span class="fl">조건</span>
          ${FILTERS.map((f) => `<button class="fbtn" data-f="${f.id}">${f.label}</button>`).join('')}
        </div>
        <div class="card-grid" id="themeGrid"></div>
      </section>
    </div>`;

  document.querySelectorAll('.fbtn').forEach((b) =>
    b.addEventListener('click', () => {
      activeFilter = b.dataset.f;
      render();
    })
  );
  render();
}

/* ---------------------------------------------- 레시피 상세 */
function viewRecipe(id) {
  const r = byId(id);
  if (!r) return viewNotFound();

  const ingRows = (arr) =>
    arr
      .map(
        (i) => `<li>
          <span class="n">${esc(i.n)}${i.note ? `<small>${esc(i.note)}</small>` : ''}</span>
          <span class="q">${esc(i.q)}</span>
        </li>`
      )
      .join('');

  const steps = r.steps
    .map(
      (s, i) => `
      <article class="step">
        <div class="step-no">${String(i + 1).padStart(2, '0')}</div>
        <div>
          <h3>${esc(s.t)}</h3>
          <p class="sd">${esc(s.d)}</p>
          ${
            s.meta
              ? `<div class="step-meta">${s.meta
                  .map((m) => `<span class="chip accent">${esc(m)}</span>`)
                  .join('')}</div>`
              : ''
          }
          ${s.tip ? `<div class="tipbox"><b>요령</b> · ${esc(s.tip)}</div>` : ''}
        </div>
      </article>`
    )
    .join('');

  app.innerHTML = `
    <div class="view">
      <section class="wrap detail">
        <div class="crumb">
          <a href="#/">오늘의 추천</a> <span>›</span>
          <a href="#/theme/${r.themes[0]}">${esc(THEMES[r.themes[0]].name)}</a>
          <span>›</span> <span>${esc(r.name)}</span>
        </div>

        <div class="detail-hero">
          <div>
            <span class="eyebrow">${esc(themeNames(r))}</span>
            <h1>${esc(r.name)}</h1>
            <p class="lead">${esc(r.summary)}</p>
            <div class="detail-traits">${traitChips(r, 6)}</div>
            <div class="forwhom">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>
              <span>${esc(r.forWhom)}</span>
            </div>
          </div>

          <div class="spec">
            <div class="spec-row"><span class="k">조리 시간</span><span class="v">${r.time}분</span></div>
            <div class="spec-row"><span class="k">기준 인분</span><span class="v">${esc(r.servings)}</span></div>
            <div class="spec-row"><span class="k">난이도</span><span class="v">${esc(r.level)}</span></div>
            <div class="spec-row"><span class="k">재료 수</span><span class="v">${r.ingredients.length}가지</span></div>
            <div class="spec-row"><span class="k">조리 단계</span><span class="v">${r.steps.length}단계</span></div>
            <button class="btn btn-primary" id="startCook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 4 14 8-14 8Z"/></svg>
              요리 모드로 보기
            </button>
            <button class="btn btn-ghost print-btn" onclick="window.print()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6Z"/></svg>
              종이로 인쇄하기
            </button>
          </div>
        </div>

        <div class="detail-body">
          <aside class="side-col">
            <div class="panel">
              <h3>재료 <span class="cnt">${esc(r.servings)} 기준</span></h3>
              <ul class="ing-list">${ingRows(r.ingredients)}</ul>
              ${
                r.seasoning && r.seasoning.length
                  ? `<p class="sub-label">양념</p><ul class="ing-list">${ingRows(r.seasoning)}</ul>`
                  : ''
              }
            </div>
          </aside>

          <div>
            <div class="steps-head">
              <div>
                <span class="eyebrow">만드는 법</span>
                <h2>${r.steps.length}단계로 끝납니다</h2>
              </div>
            </div>

            <div class="prep-box">
              <h3>미리 준비하기</h3>
              <ol>${r.prep.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>
            </div>

            ${steps}

            <div class="finish-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="flex-shrink:0;margin-top:3px"><path d="M20 6 9 17l-5-5"/></svg>
              <div>
                <h3>완성 확인</h3>
                <p>${esc(r.finish)}</p>
              </div>
            </div>

            ${
              r.tips && r.tips.length
                ? `<div class="tips-list"><h3>알아두면 좋은 점</h3><ul>${r.tips
                    .map((t) => `<li>${esc(t)}</li>`)
                    .join('')}</ul></div>`
                : ''
            }

            ${
              r.source
                ? `<div class="src-box">
                     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="flex-shrink:0;margin-top:3px"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>
                     <div>
                       <b>${esc(r.source.name)}</b>의 영상을 보고 정리했습니다.
                       ${r.source.note ? `<br>${esc(r.source.note)}` : ''}
                       <br><a href="${esc(r.source.url)}" target="_blank" rel="noopener noreferrer">원본 영상 열기 →</a>
                     </div>
                   </div>`
                : ''
            }
          </div>
        </div>
      </section>
    </div>`;

  document.getElementById('startCook').addEventListener('click', () => openCook(r));
}

/* ---------------------------------------------- 요리 모드 */
const cookEl = document.getElementById('cook');
let cookSteps = [];
let cookIdx = 0;
let cookRecipe = null;
let wakeLock = null;

function openCook(r) {
  cookRecipe = r;
  cookSteps = [
    {
      t: '재료 준비하기',
      d: r.prep.join('\n'),
      list: true,
      meta: ['조리 전 준비']
    },
    ...r.steps,
    { t: '완성', d: r.finish, meta: ['다 되었습니다'] }
  ];
  cookIdx = 0;
  document.getElementById('cookTitle').textContent = r.name;
  document.getElementById('cookSide').innerHTML = `
    <h3>재료 <span class="cnt"></span></h3>
    <ul class="ing-list">
      ${r.ingredients
        .map((i) => `<li><span class="n">${esc(i.n)}</span><span class="q">${esc(i.q)}</span></li>`)
        .join('')}
    </ul>
    ${
      r.seasoning && r.seasoning.length
        ? `<p class="sub-label">양념</p><ul class="ing-list">${r.seasoning
            .map((i) => `<li><span class="n">${esc(i.n)}</span><span class="q">${esc(i.q)}</span></li>`)
            .join('')}</ul>`
        : ''
    }`;
  cookEl.classList.add('on');
  document.body.style.overflow = 'hidden';
  updateVoiceButton();
  renderCook();
  requestWakeLock();
}

function renderCook() {
  const s = cookSteps[cookIdx];
  const total = cookSteps.length;
  const body = s.list
    ? `<ul style="margin-top:22px">${s.d
        .split('\n')
        .map(
          (p, i) =>
            `<li style="display:flex;gap:14px;padding:12px 0;border-bottom:1px solid var(--line-soft);font-size:clamp(17px,2.2vw,21px);line-height:1.8;color:var(--ink-2)"><b style="color:var(--accent);font-family:var(--font-display)">${i + 1}</b><span>${esc(p)}</span></li>`
        )
        .join('')}</ul>`
    : `<p class="cd">${esc(s.d)}</p>`;

  document.getElementById('cookMain').innerHTML = `
    <div class="cook-no">${cookIdx === 0 ? '준비' : cookIdx === total - 1 ? '마무리' : `STEP ${cookIdx} / ${total - 2}`}</div>
    <h2>${esc(s.t)}</h2>
    ${body}
    ${s.meta ? `<div class="step-meta" style="margin-top:22px">${s.meta.map((m) => `<span class="chip accent">${esc(m)}</span>`).join('')}</div>` : ''}
    ${s.tip ? `<div class="tipbox"><b>요령</b> · ${esc(s.tip)}</div>` : ''}
    ${cookIdx < total - 1 ? '<p class="cook-hint">화면 아무 곳이나 누르면 다음 단계로 넘어갑니다</p>' : ''}`;

  document.getElementById('cookPos').textContent = `${cookIdx + 1} / ${total}`;
  document.getElementById('cookProg').style.width = `${((cookIdx + 1) / total) * 100}%`;
  document.getElementById('cookDots').innerHTML = cookSteps
    .map((_, i) => `<i class="${i === cookIdx ? 'on' : ''}"></i>`)
    .join('');
  document.getElementById('cookPrev').style.visibility = cookIdx === 0 ? 'hidden' : 'visible';
  document.getElementById('cookNext').textContent =
    cookIdx === cookSteps.length - 1 ? '요리 끝내기' : '다음 단계';
  document.querySelector('.cook-body').scrollTop = 0;
  document.getElementById('cookMain').parentElement.scrollTop = 0;
  speakStep();
}

/* 요리 중에는 손이 자유롭지 않으니 단계를 소리로 읽어줍니다 */
const VOICE_KEY = 'mycook.voice';
let voiceOn = false;
try {
  voiceOn = localStorage.getItem(VOICE_KEY) === '1';
} catch (e) {}

const voiceSupported = 'speechSynthesis' in window;

function stepText(s) {
  const body = s.list ? s.d.split('\n').join(' ') : s.d;
  return `${s.t}. ${body}${s.tip ? ' 요령. ' + s.tip : ''}`;
}

function speakStep() {
  if (!voiceOn || !voiceSupported) return;
  const s = cookSteps[cookIdx];
  if (!s) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(stepText(s));
    u.lang = 'ko-KR';
    u.rate = 0.95;
    const ko = speechSynthesis
      .getVoices()
      .find((v) => v.lang && v.lang.toLowerCase().indexOf('ko') === 0);
    if (ko) u.voice = ko;
    speechSynthesis.speak(u);
  } catch (e) {
    /* 음성을 지원하지 않는 환경이면 조용히 넘어갑니다 */
  }
}

function stopSpeaking() {
  if (!voiceSupported) return;
  try {
    speechSynthesis.cancel();
  } catch (e) {}
}

function updateVoiceButton() {
  const btn = document.getElementById('cookVoice');
  if (!btn) return;
  btn.classList.toggle('on', voiceOn);
  btn.setAttribute('aria-label', voiceOn ? '읽어주기 끄기' : '읽어주기 켜기');
  btn.title = voiceOn ? '읽어주기 끄기' : '읽어주기 켜기';
  btn.innerHTML = voiceOn
    ? `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/></svg>`
    : `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6M16 9l6 6"/></svg>`;
}

function closeCook() {
  cookEl.classList.remove('on');
  document.body.style.overflow = '';
  stopSpeaking();
  if (wakeLock) {
    wakeLock.release().catch(() => {});
    wakeLock = null;
  }
}

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
  } catch (e) {
    /* 지원하지 않는 브라우저는 그냥 넘어갑니다 */
  }
}

document.getElementById('cookClose').addEventListener('click', closeCook);

document.getElementById('cookVoice').addEventListener('click', () => {
  if (!voiceSupported) {
    alert('이 브라우저는 읽어주기를 지원하지 않습니다.');
    return;
  }
  voiceOn = !voiceOn;
  try {
    localStorage.setItem(VOICE_KEY, voiceOn ? '1' : '0');
  } catch (e) {}
  updateVoiceButton();
  if (voiceOn) speakStep();
  else stopSpeaking();
});
document.getElementById('cookPrev').addEventListener('click', () => {
  if (cookIdx > 0) {
    cookIdx--;
    renderCook();
  }
});
document.getElementById('cookNext').addEventListener('click', () => {
  if (cookIdx < cookSteps.length - 1) {
    cookIdx++;
    renderCook();
  } else closeCook();
});

/* 손에 양념이 묻어 있어도 넘길 수 있게, 본문을 누르면 다음 단계로 갑니다 */
document.querySelector('.cook-main').addEventListener('click', () => {
  if (cookIdx < cookSteps.length - 1) {
    cookIdx++;
    renderCook();
  }
});
document.addEventListener('keydown', (e) => {
  if (!cookEl.classList.contains('on')) return;
  if (e.key === 'Escape') closeCook();
  if (e.key === 'ArrowRight' && cookIdx < cookSteps.length - 1) {
    cookIdx++;
    renderCook();
  }
  if (e.key === 'ArrowLeft' && cookIdx > 0) {
    cookIdx--;
    renderCook();
  }
});

/* ---------------------------------------------- 저장한 영상 (추후 확장 미리보기) */
const SAVED_KEY = 'mycook.saved.v1';

function getSaved() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function setSaved(list) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(list));
  } catch (e) {
    /* 저장할 수 없는 환경이면 화면에만 반영됩니다 */
  }
}

function viewSaved() {
  const render = () => {
    const list = getSaved();
    const grid = document.getElementById('savedGrid');
    grid.innerHTML = list.length
      ? list
          .map(
            (s, i) => `
          <div class="saved-card">
            <div class="rc-top">
              <span class="rc-theme">${esc(THEMES[s.theme] ? THEMES[s.theme].name : '분류 없음')}</span>
              <span class="chip">${esc(s.source || '링크')}</span>
            </div>
            <h3 style="font-family:var(--font-display);font-size:20px">${esc(s.name)}</h3>
            <p class="sc-url">${esc(s.url)}</p>
            <div class="sc-act">
              <a class="sc-btn" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">원본 열기</a>
              <button class="sc-btn" data-del="${i}">지우기</button>
            </div>
          </div>`
          )
          .join('')
      : `<div class="empty" style="grid-column:1/-1">
          <h3>아직 저장한 영상이 없습니다</h3>
          <p>인스타그램이나 쇼츠에서 본 요리 영상의 주소를 붙여 넣으면 여기에 모입니다.</p>
        </div>`;

    grid.querySelectorAll('[data-del]').forEach((b) =>
      b.addEventListener('click', () => {
        const next = getSaved();
        next.splice(Number(b.dataset.del), 1);
        setSaved(next);
        render();
      })
    );
  };

  const mine = RECIPES.filter((r) => r.source || r.traits.indexOf('mine') > -1);

  app.innerHTML = `
    <div class="view">
      <section class="wrap hero" style="padding-bottom:0">
        <div class="crumb"><a href="#/">오늘의 추천</a> <span>›</span> <span>내 메뉴</span></div>
        <span class="eyebrow">내가 보낸 것</span>
        <h1>내 메뉴</h1>
        <p class="hero-note">보내주신 영상에서 정리한 메뉴와, 나중에 보려고 저장해둔 영상 주소를 여기 모았습니다.</p>
      </section>

      <section class="wrap list-section" style="padding-top:34px">
        <div class="section-head">
          <div>
            <span class="eyebrow">영상에서 정리한 메뉴</span>
            <h2>지금까지 ${mine.length}개</h2>
            <p>보내주신 영상의 재료와 순서를 이 사이트 형식으로 다시 정리한 메뉴입니다.</p>
          </div>
        </div>
        ${
          mine.length
            ? `<div class="card-grid">${mine.map(cardHTML).join('')}</div>`
            : `<div class="empty"><h3>아직 정리한 메뉴가 없습니다</h3><p>요리 영상 주소를 보내주시면 레시피로 정리해 여기에 넣어드립니다.</p></div>`
        }
      </section>

      <section class="wrap list-section" style="padding-top:56px">
        <div class="section-head">
          <div>
            <span class="eyebrow">추후 확장 기능 미리보기</span>
            <h2>저장해둔 영상</h2>
            <p>나중에 다시 볼 영상의 주소를 모아둡니다.</p>
          </div>
        </div>
        <div class="notice">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="flex-shrink:0;margin-top:3px"><circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/></svg>
          <span><b>아직 제안 단계인 기능입니다.</b> 지금은 이 컴퓨터의 브라우저에만 저장되고, 재료와 조리 순서를 정리해 두는 방식은 요구사항 문서의 7.5절대로 추후에 결정합니다.</span>
        </div>

        <div class="saved-form">
          <input id="svName" type="text" placeholder="메뉴 이름 (예: 두부 김치덮밥)" />
          <input id="svUrl" type="url" placeholder="영상 주소 붙여넣기" />
          <select id="svTheme">
            <option value="onedish">한 끼 식사</option>
            <option value="side">반찬</option>
            <option value="morning">아침 메뉴</option>
          </select>
          <button class="btn btn-dark" id="svAdd">추가하기</button>
        </div>

        <div class="card-grid" id="savedGrid"></div>
      </section>
    </div>`;

  document.getElementById('svAdd').addEventListener('click', () => {
    const name = document.getElementById('svName').value.trim();
    const url = document.getElementById('svUrl').value.trim();
    const theme = document.getElementById('svTheme').value;
    if (!name || !url) {
      alert('메뉴 이름과 영상 주소를 모두 입력해 주세요.');
      return;
    }
    let source = '링크';
    if (/instagram\.com/i.test(url)) source = '인스타그램';
    else if (/youtube\.com|youtu\.be/i.test(url)) source = '유튜브 쇼츠';
    const list = getSaved();
    list.unshift({ name, url, theme, source });
    setSaved(list);
    document.getElementById('svName').value = '';
    document.getElementById('svUrl').value = '';
    render();
  });

  render();
}

/* ---------------------------------------------- 장보기 목록 */

/* 마트에서 도는 순서대로 묶습니다. 위에서부터 먼저 맞는 규칙을 씁니다. */
const MART_RULES = [
  // 양념은 집에 있을 수 있으니 따로 모읍니다
  ['양념 · 조미료', ['땅콩버터', '콩가루', '다진 마늘', '진간장', '국간장', '간장', '고추장', '된장', '고춧가루', '설탕', '소금', '후추', '식용유', '올리브유', '참기름', '들기름', '식초', '맛술', '올리고당', '꿀', '메이플', '연유', '마요네즈', '케첩', '머스터드', '굴소스', '새우젓', '액젓', '카레가루', '전분', '부침가루', '베이킹파우더', '통깨', '검은깨', '계피', '코코아', '파슬리', '파마산', '치즈가루', '버터', '국물내기 팩', '가쓰오부시', '강황', '매실청', '빵가루', '밀가루', '핫케이크', '페퍼론치노', '이스트', '레몬즙', '배즙', '사과즙']],
  ['가공식품 · 냉장', ['참치 통조림', '참치캔', '참치', '김치', '카레 고형 루', '파스타 소스', '소스', '견과류', '견과', '아몬드', '호두', '건포도', '올리브', '맛살', '단무지', '사이다', '냉동 만두', '만두', '옥수수', '다크초콜릿', '초콜릿', '젤라틴']],
  ['수산 · 건어물', ['어묵', '새우', '멸치', '진미채', '북어', '고등어', '오징어', '골뱅이', '미역', '다시마', '김가루', '구운 김', '김', '유부']],
  ['정육 · 계란', ['돼지고기', '소고기', '불고기용', '닭고기', '닭가슴살', '닭다리', '닭봉', '생닭', '닭', '베이컨', '소시지', '스팸', '햄', '메추리알', '달걀', '계란']],
  ['유제품 · 두부', ['두부', '우유', '두유', '요거트', '생크림', '치즈']],
  ['쌀 · 면 · 빵 · 떡', ['쌀', '밥', '식빵', '통밀빵', '빵', '스파게티', '소면', '쫄면', '라면', '우동 사리', '우동', '당면', '떡', '바게트', '호떡', '모닝빵', '핫도그빵', '또띠아', '오트밀', '귀리']],
  ['채소 · 과일', ['양파', '대파', '쪽파', '마늘', '감자', '고구마', '당근', '애호박', '호박', '오이', '배추', '양배추', '양상추', '깻잎', '고추', '파프리카', '피망', '버섯', '팽이', '느타리', '표고', '시금치', '콩나물', '숙주', '가지', '브로콜리', '아보카도', '부추', '우엉', '단호박', '수박', '레몬', '바나나', '사과', '딸기', '블루베리', '토마토', '생강']]
];

const SKIP_PREFIX = ['물', '찬물', '쌀뜨물', '따뜻한 물', '뜨거운 물', '얼음'];

function martGroup(name) {
  for (const [group, keys] of MART_RULES) {
    if (keys.some((k) => name.indexOf(k) > -1)) return group;
  }
  if (name === '무') return '채소 · 과일';
  return '그 밖에';
}

/* "1/2개", "1.5컵(300ml)" 같은 분량을 더할 수 있게 쪼갭니다 */
function parseQty(q) {
  // 분수를 먼저 보지 않으면 "1/4개"의 1만 읽고 "/4개"가 단위가 됩니다
  const m = String(q).trim().match(/^([0-9]+\/[0-9]+|[0-9]+(?:\.[0-9]+)?)\s*(.*)$/);
  if (!m) return null;
  let n;
  if (m[1].indexOf('/') > -1) {
    const p = m[1].split('/');
    n = Number(p[0]) / Number(p[1]);
  } else {
    n = parseFloat(m[1]);
  }
  const unit = m[2].replace(/\s*\([^)]*\)/g, '').trim();
  return { n, unit };
}

function fmtQty(n, unit) {
  const frac = { 0.25: '1/4', 0.3333: '1/3', 0.5: '1/2', 0.6667: '2/3', 0.75: '3/4' };
  const whole = Math.floor(n);
  const rest = Math.round((n - whole) * 10000) / 10000;
  let head = '';
  for (const k in frac) {
    if (Math.abs(rest - Number(k)) < 0.02) head = frac[k];
  }
  let text;
  if (head) text = whole > 0 ? `${whole}과 ${head}` : head;
  else text = String(Math.round(n * 10) / 10);
  return text + unit;
}

function buildShoppingList(days) {
  const items = {};
  const dayLabels = [];

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const ctx = todayContext(d);
    dayLabels.push(`${d.getMonth() + 1}/${d.getDate()}(${DAY_KO[d.getDay()]})`);

    buildTodayPlan(ctx, d).forEach((slot) => {
      const r = slot.recipe;
      // 양념도 함께 담습니다. 집에 없을 수 있으니 빠뜨리면 안 됩니다.
      const all = (r.ingredients || []).concat(r.seasoning || []);
      all.forEach((ing) => {
        // "식용유 또는 버터"처럼 고를 수 있는 재료는 앞의 것으로 묶습니다
        const key = ing.n.split(' 또는 ')[0].trim();
        if (SKIP_PREFIX.some((p) => key.indexOf(p) === 0)) return;
        if (!items[key]) {
          items[key] = { name: key, group: martGroup(key), qtys: [], menus: new Set(), optional: true };
        }
        items[key].qtys.push(ing.q);
        items[key].menus.add(r.name);
        if (!(ing.note && ing.note.indexOf('선택') > -1)) items[key].optional = false;
      });
    });
  }

  // 같은 단위끼리 분량을 더합니다
  Object.values(items).forEach((it) => {
    const sums = {};
    const raw = [];
    it.qtys.forEach((q) => {
      const p = parseQty(q);
      // "약간"처럼 숫자가 없는 분량은 여러 번 나와도 한 번만 적습니다
      if (p) sums[p.unit] = (sums[p.unit] || 0) + p.n;
      else if (raw.indexOf(q) === -1) raw.push(q);
    });
    const parts = Object.keys(sums).map((u) => fmtQty(sums[u], u));
    it.total = parts.concat(raw).join(' + ') || '적당량';
  });

  const grouped = {};
  Object.values(items).forEach((it) => {
    (grouped[it.group] = grouped[it.group] || []).push(it);
  });
  Object.values(grouped).forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name)));

  const order = MART_RULES.map((r) => r[0]).concat(['그 밖에']);
  const ordered = order.filter((g) => grouped[g]).map((g) => ({ group: g, items: grouped[g] }));
  return { groups: ordered, dayLabels, count: Object.keys(items).length };
}

const CART_KEY = 'mycook.cart';
let shoppingDays = 4;

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function setCart(c) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(c));
  } catch (e) {}
}

function viewShopping() {
  const render = () => {
    const data = buildShoppingList(shoppingDays);
    const cart = getCart();

    document.getElementById('shRange').textContent =
      `${data.dayLabels[0]} ~ ${data.dayLabels[data.dayLabels.length - 1]} · 재료 ${data.count}가지`;

    document.getElementById('shList').innerHTML = data.groups
      .map(
        (g) => `
        <section class="sh-group">
          <h3>${esc(g.group)} <span class="cnt">${g.items.length}</span></h3>
          <ul>
            ${g.items
              .map(
                (it) => `
              <li class="sh-row${cart[it.name] ? ' done' : ''}">
                <label>
                  <input type="checkbox" data-k="${esc(it.name)}"${cart[it.name] ? ' checked' : ''} />
                  <span class="nm">${esc(it.name)}${it.optional ? ' <span class="chip">선택</span>' : ''}</span>
                  <span class="qt">${esc(it.total)}</span>
                </label>
                <p class="src">${esc([...it.menus].join(' · '))}</p>
              </li>`
              )
              .join('')}
          </ul>
        </section>`
      )
      .join('');

    document.querySelectorAll('.sh-row input').forEach((cb) =>
      cb.addEventListener('change', () => {
        const c = getCart();
        if (cb.checked) c[cb.dataset.k] = 1;
        else delete c[cb.dataset.k];
        setCart(c);
        cb.closest('.sh-row').classList.toggle('done', cb.checked);
      })
    );

    document.querySelectorAll('.dbtn').forEach((b) =>
      b.classList.toggle('on', Number(b.dataset.d) === shoppingDays)
    );
  };

  app.innerHTML = `
    <div class="view">
      <section class="wrap hero" style="padding-bottom:0">
        <div class="crumb"><a href="#/">오늘의 추천</a> <span>›</span> <span>장보기 목록</span></div>
        <span class="eyebrow">장보기</span>
        <h1>이 기간에 필요한 재료</h1>
        <p class="hero-note">추천된 식단에 들어가는 재료를 모아 마트 코너별로 묶었습니다. 산 것은 눌러서 지울 수 있고, 이 기기에 기억됩니다.</p>
      </section>

      <section class="wrap list-section" style="padding-top:30px">
        <div class="sh-bar">
          <div class="sh-days">
            <button class="dbtn" data-d="4">오늘부터 4일</button>
            <button class="dbtn" data-d="7">일주일</button>
          </div>
          <span class="sh-range" id="shRange"></span>
          <div class="sh-acts">
            <button class="sc-btn" onclick="window.print()">인쇄</button>
            <button class="sc-btn" id="shCopy">목록 복사</button>
            <button class="sc-btn" id="shReset">체크 지우기</button>
          </div>
        </div>
        <div id="shList" class="sh-list"></div>
      </section>
    </div>`;

  document.querySelectorAll('.dbtn').forEach((b) =>
    b.addEventListener('click', () => {
      shoppingDays = Number(b.dataset.d);
      render();
    })
  );

  document.getElementById('shReset').addEventListener('click', () => {
    setCart({});
    render();
  });

  document.getElementById('shCopy').addEventListener('click', () => {
    const data = buildShoppingList(shoppingDays);
    const text =
      `마이쿡 장보기 (${data.dayLabels[0]} ~ ${data.dayLabels[data.dayLabels.length - 1]})\n\n` +
      data.groups
        .map(
          (g) =>
            `[${g.group}]\n` +
            g.items.map((it) => `- ${it.name} ${it.total}${it.optional ? ' (선택)' : ''}`).join('\n')
        )
        .join('\n\n');
    const btn = document.getElementById('shCopy');
    const done = () => {
      btn.textContent = '복사했습니다';
      setTimeout(() => (btn.textContent = '목록 복사'), 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, () => alert(text));
    } else {
      alert(text);
    }
  });

  render();
}

/* ---------------------------------------------- 재료로 찾기
 * 냉장고에 있는 재료를 고르면 그걸로 만들 수 있는 메뉴를 보여줍니다.
 *
 * 레시피마다 재료 이름이 조금씩 다릅니다. "김치"도 어떤 메뉴에는
 * "신김치", 어떤 메뉴에는 "잘 익은 김치"로 적혀 있습니다. 그대로 두면
 * 같은 재료인데 따로 떨어져 고를 수가 없어서, 아래 규칙으로 대표 이름
 * 하나에 묶습니다. 위에서부터 먼저 맞는 규칙을 씁니다.
 *
 * 새 재료를 쓰는 메뉴를 넣었는데 화면에 안 보이면 여기에 한 줄 더하세요. */
const ING_SAME = [
  // 뒤에 오는 넓은 규칙에 잘못 걸리는 것들을 먼저 빼냅니다
  ['새우젓', ['새우젓']],
  ['전분', ['전분', '부침가루']],
  ['밀가루', ['밀가루', '핫케이크']],
  ['파스타 소스', ['파스타 소스', '소스']],

  // 유제품 · 두부
  ['순두부', ['순두부', '연두부']],
  ['두부', ['두부']],
  ['치즈', ['치즈']],
  ['요거트', ['요거트']],
  ['생크림', ['생크림']],
  ['우유', ['우유', '두유']],

  // 정육 · 계란
  ['달걀', ['달걀', '계란']],
  ['메추리알', ['메추리알']],
  ['돼지고기', ['돼지고기', '목살']],
  ['소고기', ['소고기']],
  ['닭고기', ['닭가슴살', '닭다리', '닭봉', '생닭', '닭']],
  ['베이컨', ['베이컨']],
  ['소시지', ['소시지']],
  ['햄 · 스팸', ['스팸', '햄']],

  // 가공식품 · 냉장
  ['김치', ['김치']],
  ['참치캔', ['참치']],
  ['냉동 만두', ['만두']],
  ['카레 고형 루', ['카레']],
  ['견과', ['견과', '아몬드', '호두']],
  ['다크초콜릿', ['초콜릿']],
  ['젤라틴', ['젤라틴']],
  ['옥수수 캔', ['옥수수']],
  ['맛살', ['맛살']],
  ['단무지', ['단무지']],
  ['건포도', ['건포도']],
  ['사이다', ['사이다']],
  ['올리브', ['올리브']],

  // 수산 · 건어물 ('김가루'와 '김치'보다 뒤에 '김'이 와야 합니다)
  ['어묵', ['어묵']],
  ['새우', ['새우']],
  ['멸치', ['멸치']],
  ['진미채', ['진미채']],
  ['북어채', ['북어']],
  ['고등어', ['고등어']],
  ['오징어', ['오징어']],
  ['골뱅이', ['골뱅이']],
  ['미역', ['미역']],
  ['유부', ['유부']],
  ['김가루', ['김가루']],
  ['김', ['구운 김', '김']],

  // 쌀 · 면 · 빵 · 떡
  ['밥', ['밥']],
  ['쌀', ['쌀']],
  ['호떡믹스', ['호떡']],
  ['바게트', ['바게트']],
  ['모닝빵', ['모닝빵', '핫도그빵']],
  ['또띠아', ['또띠아']],
  ['식빵', ['식빵', '통밀빵', '빵']],
  ['쫄면', ['쫄면']],
  ['라면', ['라면']],
  ['소면', ['소면']],
  ['우동 사리', ['우동']],
  ['스파게티 면', ['스파게티']],
  ['당면', ['당면']],
  ['떡', ['떡']],
  ['오트밀', ['오트밀', '귀리']],

  // 채소 · 과일 ('양배추'가 '배추'보다 앞에 있어야 합니다)
  ['양파', ['양파']],
  ['대파', ['대파']],
  ['쪽파', ['쪽파']],
  ['부추', ['부추']],
  ['마늘', ['마늘']],
  ['감자', ['감자']],
  ['고구마', ['고구마']],
  ['당근', ['당근']],
  ['단호박', ['단호박']],
  ['애호박', ['애호박', '호박']],
  ['우엉', ['우엉']],
  ['수박', ['수박']],
  ['레몬', ['레몬']],
  ['오이', ['오이']],
  ['양배추', ['양배추']],
  ['양상추', ['양상추']],
  ['배추', ['배추']],
  ['깻잎', ['깻잎']],
  ['고추', ['고추']],
  ['파프리카', ['파프리카', '피망']],
  ['버섯', ['버섯']],
  ['시금치', ['시금치']],
  ['콩나물', ['콩나물']],
  ['숙주', ['숙주']],
  ['가지', ['가지']],
  ['브로콜리', ['브로콜리']],
  ['토마토', ['토마토']],
  ['아보카도', ['아보카도']],
  ['바나나', ['바나나']],
  ['사과', ['사과']],
  ['딸기', ['딸기']],
  ['블루베리', ['블루베리']]
];

/* 재료 이름 하나를 대표 이름으로 바꿉니다. 고를 수 없는 재료면 빈 값입니다. */
function canonIng(raw) {
  // "A 또는 B"는 앞의 것만 봅니다. 괄호 안 설명도 뗍니다.
  let name = String(raw).split(' 또는 ')[0].replace(/\s*\([^)]*\)/g, '').trim();
  if (!name) return '';

  // 물은 사러 가지 않습니다
  if (SKIP_PREFIX.indexOf(name) > -1) return '';

  let canon = name;
  for (const [rep, keys] of ING_SAME) {
    if (keys.some((k) => name.indexOf(k) > -1)) {
      canon = rep;
      break;
    }
  }

  // 소금·간장처럼 늘 집에 있는 것은 고를 재료가 아닙니다
  if (martGroup(canon) === '양념 · 조미료') return '';
  return canon;
}

/* 메뉴마다 "고를 수 있는 재료" 목록을 한 번만 만들어 기억해 둡니다 */
let ingIndexCache = null;

function ingIndex() {
  if (ingIndexCache) return ingIndexCache;
  const byRecipe = {};
  const count = {};

  RECIPES.forEach((r) => {
    const list = [];
    (r.ingredients || []).forEach((i) => {
      const c = canonIng(i.n);
      if (c && list.indexOf(c) === -1) list.push(c);
    });
    byRecipe[r.id] = list;
    list.forEach((c) => (count[c] = (count[c] || 0) + 1));
  });

  // 재료를 마트 코너별로 묶고, 많이 쓰이는 것을 앞에 둡니다
  const groups = {};
  Object.keys(count).forEach((c) => {
    const g = martGroup(c);
    (groups[g] = groups[g] || []).push(c);
  });
  const order = ['채소 · 과일', '정육 · 계란', '유제품 · 두부', '수산 · 건어물',
    '가공식품 · 냉장', '쌀 · 면 · 빵 · 떡', '그 밖에'];
  const picker = order
    .filter((g) => groups[g])
    .map((g) => ({
      group: g,
      items: groups[g].sort((a, b) => count[b] - count[a] || a.localeCompare(b, 'ko'))
    }));

  ingIndexCache = { byRecipe, count, picker };
  return ingIndexCache;
}

/* 고른 재료는 이 기기에 기억해 둡니다 */
const FRIDGE_KEY = 'mycook.fridge';

function getFridge() {
  try {
    const v = JSON.parse(localStorage.getItem(FRIDGE_KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch (e) {
    return [];
  }
}

function setFridge(list) {
  try {
    localStorage.setItem(FRIDGE_KEY, JSON.stringify(list));
  } catch (e) {
    /* 저장이 막혀 있어도 화면은 그대로 씁니다 */
  }
}

/* 고른 재료로 메뉴를 추려 "모자란 재료가 적은 순"으로 줄 세웁니다 */
function matchRecipes(picked) {
  const idx = ingIndex();
  const has = {};
  picked.forEach((p) => (has[p] = 1));

  return RECIPES.map((r) => {
    const all = idx.byRecipe[r.id] || [];
    const have = all.filter((c) => has[c]);
    const miss = all.filter((c) => !has[c]);
    return { r, have, miss, all };
  })
    .filter((m) => m.have.length > 0)
    .sort(
      (a, b) =>
        a.miss.length - b.miss.length ||
        b.have.length - a.have.length ||
        a.r.time - b.r.time
    );
}

function matchCardHTML(m) {
  const miss = m.miss.length
    ? `<p class="rc-ing ing-miss"><b>${m.miss.length}가지만 더</b> · ${esc(m.miss.join(' · '))}</p>`
    : `<p class="rc-ing ing-ok"><b>재료가 다 있습니다</b></p>`;
  return `
    <a class="rc" href="#/recipe/${m.r.id}">
      <div class="rc-top">
        <span class="rc-theme">${esc(themeNames(m.r))}</span>
        <span class="rc-time">${m.r.time}분</span>
      </div>
      <h3>${esc(m.r.name)}</h3>
      <p class="rc-tag">${esc(m.r.tagline)}</p>
      <p class="rc-ing ing-have"><b>가진 재료 ${m.have.length}가지</b> · ${esc(m.have.join(' · '))}</p>
      ${miss}
    </a>`;
}

/* ---------------------------------------------- 영수증 · 냉장고 목록 읽기 */

/* 영수증에서 아예 건너뛸 줄입니다 */
const RECEIPT_DROP = /합계|소계|총액|부가세|면세|과세|카드|승인|결제|현금|거스름|받을|포인트|적립|할인|행사|영수증|사업자|대표자|주소|전화|구매일|거래|매출|잔액|계산원|교환|환불|단말기|가맹점/;

/* 먹는 재료가 아니거나 집에 늘 있는 것. '고추장'이 '고추'로 잡히지 않게 먼저 둡니다. */
const RECEIPT_SKIP = [
  '고추장', '고추가루', '고춧가루', '된장', '쌈장', '진간장', '국간장', '간장',
  '참기름', '들기름', '식용유', '올리브유', '포도씨유', '카놀라유',
  '설탕', '소금', '후추', '식초', '맛술', '미림', '마요네즈', '케첩',
  '머스타드', '머스터드', '굴소스', '액젓', '새우젓', '올리고당', '물엿',
  '밀가루', '부침가루', '튀김가루', '빵가루', '전분', '통깨', '참깨',
  '다시다', '미원', '맛소금', '베이킹파우더', '매실청',
  '봉투', '비닐', '쇼핑백', '종량제', '휴지', '물티슈', '키친타월',
  '세제', '섬유유연제', '샴푸', '비누', '치약', '칫솔', '수세미',
  '생수', '콜라', '커피', '녹차', '주스', '맥주', '소주', '막걸리', '와인',
  '담배', '건전지', '종이컵', '호일', '랩'
];

/* 마트에서 쓰는 이름을 우리 재료 이름으로 바꿉니다 */
const RECEIPT_ALIAS = [
  // 밥 · 면 · 빵 · 떡
  ['햇반', '밥'], ['즉석밥', '밥'], ['흰밥', '밥'],
  ['떡볶이떡', '떡'], ['밀떡', '떡'], ['쌀떡', '떡'], ['가래떡', '떡'], ['떡국떡', '떡'], ['조랭이', '떡'],
  ['신라면', '라면'], ['진라면', '라면'], ['안성탕면', '라면'], ['너구리', '라면'],
  ['짜파게티', '라면'], ['삼양라면', '라면'], ['불닭', '라면'], ['라면사리', '라면'],
  ['국수', '소면'],
  ['파스타면', '스파게티 면'], ['스파게티', '스파게티 면'], ['링귀니', '스파게티 면'], ['푸실리', '스파게티 면'],
  ['우동사리', '우동 사리'], ['생우동', '우동 사리'],
  ['토스트식빵', '식빵'], ['우유식빵', '식빵'], ['통밀식빵', '식빵'],
  ['토르티야', '또띠아'], ['토티야', '또띠아'],
  ['핫도그번', '모닝빵'], ['버거번', '모닝빵'], ['모닝롤', '모닝빵'],
  ['바게뜨', '바게트'],
  ['귀리', '오트밀'],

  // 정육 · 계란
  ['특란', '달걀'], ['대란', '달걀'], ['왕란', '달걀'], ['구운란', '달걀'],
  ['훈제란', '달걀'], ['유정란', '달걀'], ['계란', '달걀'],
  ['삼겹살', '돼지고기'], ['목살', '돼지고기'], ['목전지', '돼지고기'],
  ['앞다리', '돼지고기'], ['뒷다리', '돼지고기'], ['돈육', '돼지고기'],
  ['돈등심', '돼지고기'], ['돈안심', '돼지고기'], ['돼지등심', '돼지고기'], ['돼지안심', '돼지고기'],
  ['항정살', '돼지고기'], ['갈매기살', '돼지고기'], ['제육', '돼지고기'], ['돼지갈비', '돼지고기'],
  ['한우', '소고기'], ['우육', '소고기'], ['차돌박이', '소고기'], ['차돌', '소고기'],
  ['양지', '소고기'], ['사태', '소고기'], ['채끝', '소고기'], ['안심', '소고기'],
  ['등심', '소고기'], ['불고기', '소고기'], ['국거리', '소고기'],
  ['닭가슴살', '닭고기'], ['닭안심', '닭고기'], ['닭다리', '닭고기'], ['닭봉', '닭고기'],
  ['닭날개', '닭고기'], ['윙봉', '닭고기'], ['생닭', '닭고기'], ['토종닭', '닭고기'], ['닭볶음탕', '닭고기'],
  ['비엔나', '소시지'], ['후랑크', '소시지'], ['프랑크', '소시지'], ['그릴소시지', '소시지'],
  ['런천미트', '햄 · 스팸'], ['스팸', '햄 · 스팸'], ['캔햄', '햄 · 스팸'], ['슬라이스햄', '햄 · 스팸'],

  // 유제품 · 두부
  ['부침두부', '두부'], ['찌개두부', '두부'], ['손두부', '두부'],
  ['연두부', '순두부'],
  ['모짜렐라', '치즈'], ['모차렐라', '치즈'], ['체다', '치즈'], ['슬라이스치즈', '치즈'],
  ['스트링치즈', '치즈'], ['피자치즈', '치즈'], ['크림치즈', '치즈'],
  ['요구르트', '요거트'], ['요플레', '요거트'], ['그릭', '요거트'],
  ['휘핑크림', '생크림'], ['휘핑', '생크림'],
  ['저지방우유', '우유'], ['멸균우유', '우유'], ['두유', '우유'], ['서울우유', '우유'],

  // 수산 · 건어물
  ['사각어묵', '어묵'], ['오뎅', '어묵'], ['부산어묵', '어묵'],
  ['칵테일새우', '새우'], ['흰다리새우', '새우'], ['냉동새우', '새우'],
  ['다시멸치', '멸치'], ['볶음멸치', '멸치'], ['잔멸치', '멸치'], ['디포리', '멸치'],
  ['간고등어', '고등어'], ['손질오징어', '오징어'], ['물오징어', '오징어'],
  ['황태', '북어채'],
  ['건미역', '미역'], ['자른미역', '미역'],
  ['조미김', '김'], ['도시락김', '김'], ['김밥김', '김'], ['구운김', '김'],
  ['맛김', '김'], ['전장김', '김'], ['김자반', '김가루'],
  ['유부초밥', '유부'],

  // 가공식품 · 냉장
  ['동원참치', '참치캔'], ['참치살', '참치캔'], ['참치', '참치캔'],
  ['비비고만두', '냉동 만두'], ['군만두', '냉동 만두'], ['물만두', '냉동 만두'], ['교자', '냉동 만두'],
  ['크래미', '맛살'], ['게맛살', '맛살'],
  ['포기김치', '김치'], ['총각김치', '김치'], ['열무김치', '김치'], ['묵은지', '김치'],
  ['스위트콘', '옥수수 캔'], ['옥수수', '옥수수 캔'],
  ['칠성사이다', '사이다'], ['스프라이트', '사이다'],
  ['아몬드', '견과'], ['호두', '견과'], ['캐슈넛', '견과'], ['믹스넛', '견과'],
  ['초코칩', '다크초콜릿'], ['초콜릿', '다크초콜릿'],
  ['고형카레', '카레 고형 루'], ['카레', '카레 고형 루'],

  // 채소 · 과일
  ['호박고구마', '고구마'], ['밤고구마', '고구마'],
  ['쥬키니', '애호박'], ['주키니', '애호박'],
  ['미니단호박', '단호박'],
  ['깐마늘', '마늘'], ['통마늘', '마늘'],
  ['수미감자', '감자'], ['햇감자', '감자'],
  ['실파', '쪽파'], ['깐대파', '대파'],
  ['알배추', '배추'], ['알배기', '배추'], ['절임배추', '배추'],
  ['로메인', '양상추'],
  ['청양고추', '고추'], ['홍고추', '고추'], ['풋고추', '고추'], ['오이고추', '고추'],
  ['느타리', '버섯'], ['새송이', '버섯'], ['팽이', '버섯'],
  ['양송이', '버섯'], ['표고', '버섯'], ['만가닥', '버섯'],
  ['방울토마토', '토마토'], ['대추토마토', '토마토'], ['완숙토마토', '토마토'],
  ['숙주나물', '숙주'], ['취청오이', '오이'], ['백오이', '오이']
];

/* 찾을 이름을 한 줄로 모읍니다. 긴 이름이 먼저 맞아야 '호박고구마'가 '호박'으로 잡히지 않습니다. */
let receiptKeysCache = null;

function receiptKeys() {
  if (receiptKeysCache) return receiptKeysCache;
  const list = RECEIPT_SKIP.map((k) => [k, '']).concat(RECEIPT_ALIAS);
  // 우리가 쓰는 재료 이름 그대로도 찾습니다
  ingIndex().picker.forEach((g) => g.items.forEach((c) => list.push([c, c])));
  list.sort((a, b) => b[0].length - a[0].length);
  receiptKeysCache = list;
  return receiptKeysCache;
}

/* 영수증 한 줄에서 수량 · 가격 · 회사 이름을 떼어냅니다 */
function cleanReceiptLine(line) {
  let s = String(line);
  s = s.replace(/\[[^\]]*\]/g, ' ');                 // [1+1] 같은 꼬리표
  s = s.replace(/\([^)]*\)/g, ' ');                  // 괄호 설명
  s = s.replace(/[가-힣A-Za-z]{1,6}\)/g, ' ');       // '농심)' 같은 회사 이름
  s = s.replace(/[0-9][0-9,.]*\s*(kg|g|ml|l|cc)\b/gi, ' ');
  s = s.replace(/[0-9][0-9,.]*\s*(개입|개|입|구|팩|봉지|봉|박스|캔|병|장|매|포|단|망|줄|미|마리|쪽|통|인분)/g, ' ');
  s = s.replace(/[xX*]\s*[0-9]+/g, ' ');
  s = s.replace(/[0-9][0-9,.]*/g, ' ');              // 남은 숫자와 금액
  s = s.replace(/[^가-힣A-Za-z ]+/g, ' ');
  return s.replace(/\s+/g, ' ').trim();
}

/* 붙여넣은 글에서 우리가 아는 재료를 골라냅니다 */
function parseReceipt(text) {
  const keys = receiptKeys();
  const pickable = {};
  ingIndex().picker.forEach((g) => g.items.forEach((c) => (pickable[c] = 1)));

  const found = [];
  const unknown = [];

  String(text)
    .split(/[\n,;·\/]+/)
    .forEach((raw) => {
      if (RECEIPT_DROP.test(raw)) return;
      const s = cleanReceiptLine(raw);
      if (!s || s.replace(/[^가-힣]/g, '').length < 1) return;

      let hit = null;
      for (const [k, canon] of keys) {
        // 한 글자짜리 이름은 그 줄이 통째로 같을 때만 봅니다
        if (k.length === 1 ? s === k : s.indexOf(k) > -1) {
          hit = canon;
          break;
        }
      }
      if (hit === null) {
        if (unknown.indexOf(s) === -1) unknown.push(s);
        return;
      }
      if (!hit || !pickable[hit]) return;   // 양념이거나 쓰는 메뉴가 없는 재료
      if (found.indexOf(hit) === -1) found.push(hit);
    });

  return { found, unknown: unknown.slice(0, 6) };
}

let ingQuery = '';

function viewIngredients() {
  const idx = ingIndex();

  const render = () => {
    const picked = getFridge();

    // 재료 고르는 칸
    const q = ingQuery.trim();
    document.getElementById('ingPick').innerHTML = idx.picker
      .map((g) => {
        const items = q ? g.items.filter((c) => c.indexOf(q) > -1) : g.items;
        if (!items.length) return '';
        return `
          <div class="ing-group">
            <h3>${esc(g.group)}</h3>
            <div class="ing-chips">
              ${items
                .map(
                  (c) =>
                    `<button class="fbtn ing-chip${picked.indexOf(c) > -1 ? ' on' : ''}" data-i="${esc(c)}">${esc(c)} <span class="cnt">${idx.count[c]}</span></button>`
                )
                .join('')}
            </div>
          </div>`;
      })
      .join('') ||
      `<div class="empty"><h3>그런 재료는 없습니다</h3><p>다른 말로 찾아보세요.</p></div>`;

    document.querySelectorAll('.ing-chip').forEach((b) =>
      b.addEventListener('click', () => {
        const list = getFridge();
        const at = list.indexOf(b.dataset.i);
        if (at > -1) list.splice(at, 1);
        else list.push(b.dataset.i);
        setFridge(list);
        render();
      })
    );

    // 고른 재료 요약
    document.getElementById('ingCount').textContent = picked.length
      ? `${picked.length}가지 골랐습니다 · ${picked.join(' · ')}`
      : '아직 고른 재료가 없습니다';
    document.getElementById('ingClear').style.display = picked.length ? '' : 'none';

    // 결과
    const out = document.getElementById('ingResult');
    if (!picked.length) {
      out.innerHTML = `
        <div class="empty">
          <h3>냉장고에 있는 재료를 눌러보세요</h3>
          <p>고른 재료가 들어가는 메뉴를, 더 사야 할 재료가 적은 순서로 보여줍니다.</p>
        </div>`;
      return;
    }

    const all = matchRecipes(picked);
    const now = all.filter((m) => m.miss.length === 0);
    const soon = all.filter((m) => m.miss.length > 0 && m.miss.length <= 2);
    const later = all.filter((m) => m.miss.length > 2).slice(0, 12);

    const block = (title, note, list) =>
      list.length
        ? `<section class="ing-result-group">
             <div class="section-head">
               <div>
                 <h2>${title} <span class="cnt">${list.length}</span></h2>
                 <p>${note}</p>
               </div>
             </div>
             <div class="card-grid">${list.map(matchCardHTML).join('')}</div>
           </section>`
        : '';

    out.innerHTML =
      block('지금 바로 만들 수 있어요', '고른 재료만으로 끝납니다. 양념은 집에 있는 것으로 봤습니다.', now) +
      block('1~2가지만 더 사면', '빠진 재료는 카드마다 적어두었습니다.', soon) +
      block('조금 더 사야 해요', '고른 재료가 들어가긴 합니다. 많이 나오는 순서로 12개만 보여줍니다.', later) ||
      `<div class="empty">
         <h3>맞는 메뉴가 없습니다</h3>
         <p>재료를 몇 가지 더 골라보세요.</p>
       </div>`;
  };

  app.innerHTML = `
    <div class="view">
      <section class="wrap hero" style="padding-bottom:0">
        <div class="crumb"><a href="#/">오늘의 추천</a> <span>›</span> <span>재료로 찾기</span></div>
        <span class="eyebrow">재료로 찾기</span>
        <h1>있는 재료로 뭘 만들까</h1>
        <p class="hero-note">냉장고에 있는 것을 눌러두면 그걸로 만들 수 있는 메뉴를 찾아줍니다. 장 보고 온 영수증을 붙여넣어도 재료만 골라냅니다. 고른 재료는 이 기기에 기억되니 다음에 와도 그대로 있습니다.</p>
      </section>

      <section class="wrap list-section" style="padding-top:30px">
        <details class="ing-paste" id="ingPasteBox">
          <summary>영수증이나 냉장고 목록을 붙여넣기</summary>
          <div class="ing-paste-body">
            <p class="ing-paste-note">마트 영수증을 그대로 붙여넣어도 되고, 있는 재료를 줄을 바꾸거나 쉼표로 나눠 적어도 됩니다. 수량과 가격, 회사 이름은 알아서 걸러냅니다.</p>
            <textarea id="ingPasteText" rows="7" aria-label="영수증이나 재료 목록" placeholder="예)&#10;풀무원 부침두부 300G    2    3,980&#10;무항생제 특란 10구       1    4,980&#10;농심)신라면 5입&#10;대파, 양파, 애호박"></textarea>
            <div class="ing-paste-act">
              <button class="btn btn-primary" id="ingPasteGo">재료 찾아내기</button>
              <button class="sc-btn" id="ingPasteReset">입력 지우기</button>
            </div>
            <div class="ing-paste-out" id="ingPasteOut"></div>
          </div>
        </details>

        <div class="ing-bar">
          <input class="ing-search" id="ingSearch" type="search" placeholder="재료 이름으로 찾기 (예: 두부)" aria-label="재료 이름으로 찾기" />
          <span class="ing-count" id="ingCount"></span>
          <button class="sc-btn" id="ingClear">고른 재료 지우기</button>
        </div>
        <div class="ing-pick" id="ingPick"></div>
        <div id="ingResult"></div>
      </section>
    </div>`;

  const search = document.getElementById('ingSearch');
  search.value = ingQuery;
  search.addEventListener('input', () => {
    ingQuery = search.value;
    render();
  });

  document.getElementById('ingClear').addEventListener('click', () => {
    setFridge([]);
    render();
  });

  // 영수증 · 재료 목록 붙여넣기
  const pasteOut = document.getElementById('ingPasteOut');

  document.getElementById('ingPasteGo').addEventListener('click', () => {
    const txt = document.getElementById('ingPasteText').value;
    if (!txt.trim()) {
      pasteOut.innerHTML = '<p class="ing-paste-msg">먼저 영수증이나 재료를 붙여넣어 주세요.</p>';
      return;
    }

    const res = parseReceipt(txt);
    if (!res.found.length) {
      pasteOut.innerHTML =
        '<p class="ing-paste-msg">아는 재료를 찾지 못했습니다. 재료 이름만 쉼표로 나눠 적어보세요.</p>';
      return;
    }

    const list = getFridge();
    let already = 0;
    res.found.forEach((c) => {
      if (list.indexOf(c) === -1) list.push(c);
      else already += 1;
    });
    setFridge(list);

    pasteOut.innerHTML =
      `<p class="ing-paste-msg ok"><b>${res.found.length}가지를 찾았습니다</b> · ${esc(res.found.join(' · '))}</p>` +
      (already ? `<p class="ing-paste-msg">그 가운데 ${already}가지는 이미 골라둔 것이었습니다.</p>` : '') +
      (res.unknown.length
        ? `<p class="ing-paste-msg">모르는 줄은 건너뛰었습니다 · ${esc(res.unknown.join(' · '))}</p>`
        : '');

    render();
  });

  document.getElementById('ingPasteReset').addEventListener('click', () => {
    document.getElementById('ingPasteText').value = '';
    pasteOut.innerHTML = '';
  });

  render();
}

function viewNotFound() {
  app.innerHTML = `
    <div class="view wrap" style="padding-top:80px">
      <div class="empty">
        <h3>찾는 화면이 없습니다</h3>
        <p>주소가 바뀌었을 수 있습니다.</p>
        <a class="btn btn-primary" href="#/" style="margin-top:20px">오늘의 추천으로 가기</a>
      </div>
    </div>`;
}

/* ---------------------------------------------- 라우터 */
function route() {
  const hash = location.hash.replace(/^#\/?/, '');
  const [seg, arg] = hash.split('/');

  if (!seg) viewHome();
  else if (seg === 'theme') {
    activeFilter = 'all';
    viewTheme(arg);
  } else if (seg === 'recipe') viewRecipe(arg);
  else if (seg === 'ingredients') viewIngredients();
  else if (seg === 'saved') viewSaved();
  else if (seg === 'shopping') viewShopping();
  else viewNotFound();

  const current = hash || '';
  document.querySelectorAll('.nav a').forEach((a) => {
    const r = a.dataset.route === 'home' ? '' : a.dataset.route;
    a.classList.toggle('active', r === current);
  });
  document.getElementById('nav').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

window.addEventListener('hashchange', route);

/* ---------------------------------------------- 화면 밝기 / 메뉴 */
const THEME_KEY = 'mycook.theme';

function applyTheme(mode) {
  document.documentElement.dataset.theme = mode;
  document.getElementById('themeIcon').setAttribute(
    'd',
    mode === 'dark'
      ? 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4'
      : 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z'
  );
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch (e) {}
}

document.getElementById('themeToggle').addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('nav').classList.toggle('open');
});

/* ---------------------------------------------- 시작 */
(function init() {
  let saved = null;
  try {
    saved = localStorage.getItem(THEME_KEY);
  } catch (e) {}
  applyTheme(
    saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
  if (!location.hash) location.hash = '#/';
  route();
})();
