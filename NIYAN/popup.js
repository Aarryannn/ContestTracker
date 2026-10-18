
const contestList = document.getElementById("contestList");
const contestCount = document.getElementById("contestCount");
const nextCountdown = document.getElementById("nextCountdown");
const searchInput = document.getElementById("searchInput");
const refreshBtn = document.getElementById("refreshBtn");
const filterButtons = document.querySelectorAll(".filterBtn");

const DAY = 24 * 60 * 60 * 1000;

const API = {
  codeforces: "https://codeforces.com/api/contest.list?gym=false",
  leetcode: "https://alfa-leetcode-api.onrender.com/contests/upcoming"
};

const CACHE_KEYS = {
  codeforces: "cachedCodeforcesContests",
  leetcode: "cachedLeetCodeContests"
};

let activeFilter = "all";
let contests = [];

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatCountdown(timestamp) {
  const remaining = Math.max(0, timestamp - Date.now());

  const days = Math.floor(remaining / DAY);
  const hours = Math.floor((remaining % DAY) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;

  return [hours, minutes, seconds]
    .map(value => String(value).padStart(2, "0"))
    .join(":");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function storageGet(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, result => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve(result[key]);
    });
  });
}

function storageSet(key, value) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve();
    });
  });
}

async function getCachedContests(key) {
  try {
    const cached = await storageGet(key);

    if (!cached || !Array.isArray(cached.items)) {
      return [];
    }

    return cached.items;
  } catch (error) {
    console.error(`Cache read failed for ${key}:`, error);
    return [];
  }
}

async function saveCachedContests(key, items) {
  try {
    await storageSet(key, {
      items,
      savedAt: Date.now()
    });
  } catch (error) {
    console.error(`Cache write failed for ${key}:`, error);
  }
}

async function fetchJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${url}`);
  }

  return response.json();
}

async function fetchCodeforcesContests() {
  const data = await fetchJSON(API.codeforces);

  if (data.status !== "OK") {
    throw new Error(data.comment || "Codeforces API request failed");
  }

  return data.result
    .filter(contest =>
      contest.phase === "BEFORE" &&
      Number.isFinite(contest.startTimeSeconds) &&
      contest.startTimeSeconds * 1000 > Date.now()
    )
    .map(contest => {
      const division = contest.name.match(
        /\b(Div(?:ision)?\.?\s*[1-4]|Educational|Global Round)\b/i
      );

      return {
        id: `cf-${contest.id}`,
        name: contest.name,
        platform: "Codeforces",
        type: division ? division[0] : "Codeforces",
        startTime: contest.startTimeSeconds * 1000,
        duration: Math.round(contest.durationSeconds / 60),
        url: `https://codeforces.com/contest/${contest.id}`
      };
    });
}

function normalizeLeetCodeContests(data) {
  const items = Array.isArray(data)
    ? data
    : data?.contests ?? data?.data ?? data?.result ?? [];

  if (!Array.isArray(items)) {
    throw new Error("Unexpected LeetCode API response");
  }

  return items.map((contest, index) => {
    const name =
      contest.title ||
      contest.name ||
      contest.contestTitle ||
      "LeetCode Contest";

    const rawTime =
      contest.startTime ??
      contest.start_time ??
      contest.startTimeSeconds ??
      contest.start_time_seconds ??
      contest.startDate ??
      contest.start_date;

    let startTime;

    if (typeof rawTime === "string" && !/^\d+(\.\d+)?$/.test(rawTime)) {
      startTime = Date.parse(rawTime);
    } else {
      startTime = Number(rawTime);

      if (Number.isFinite(startTime) && startTime < 1e12) {
        startTime *= 1000;
      }
    }

    const slug =
      contest.titleSlug ||
      contest.title_slug ||
      contest.slug;

    const rawDuration =
      contest.duration ??
      contest.durationSeconds ??
      contest.duration_seconds ??
      contest.durationMinutes ??
      contest.duration_minutes;

    let duration = Number(rawDuration);

    if (!Number.isFinite(duration) || duration <= 0) {
      duration = 90;
    } else if (
      contest.durationSeconds !== undefined ||
      contest.duration_seconds !== undefined ||
      duration > 1000
    ) {
      duration = Math.round(duration / 60);
    }

    return {
      id: `lc-${contest.id ?? slug ?? index}`,
      name,
      platform: "LeetCode",
      type: /biweekly/i.test(name) ? "Biweekly" : "Weekly",
      startTime,
      duration,
      url: slug
        ? `https://leetcode.com/contest/${slug}/`
        : "https://leetcode.com/contest/"
    };
  }).filter(contest =>
    Number.isFinite(contest.startTime) &&
    contest.startTime > Date.now()
  );
}

async function fetchLeetCodeContests() {
  const data = await fetchJSON(API.leetcode);
  return normalizeLeetCodeContests(data);
}

function getFilteredContests() {
  const query = searchInput.value.trim().toLowerCase();

  return contests
    .filter(contest => contest.startTime > Date.now())
    .filter(contest =>
      activeFilter === "all" ||
      contest.platform === activeFilter
    )
    .filter(contest =>
      `${contest.name} ${contest.platform} ${contest.type}`
        .toLowerCase()
        .includes(query)
    )
    .sort((a, b) => a.startTime - b.startTime);
}

function createContestCard(contest) {
  const isLeetCode = contest.platform === "LeetCode";

  const badgeClass = isLeetCode
    ? "bg-orange-500/10 text-orange-400"
    : "bg-blue-500/10 text-blue-400";

  return `
    <article class="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 transition hover:border-zinc-700">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <span class="inline-block rounded-md px-2 py-1 text-[10px] font-semibold ${badgeClass}">
            ${escapeHTML(contest.platform)}
          </span>

          <h3 class="mt-2 text-sm font-semibold text-zinc-100">
            ${escapeHTML(contest.name)}
          </h3>

          <p class="mt-1 text-xs text-zinc-500">
            ${escapeHTML(contest.type)} · ${contest.duration} minutes
          </p>
        </div>

        <div class="shrink-0 text-right">
          <p class="text-[10px] text-zinc-500">Starts in</p>
          <p
            class="countdown mt-1 font-mono text-xs text-orange-400"
            data-start="${contest.startTime}"
          >
            ${formatCountdown(contest.startTime)}
          </p>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between gap-2 border-t border-zinc-800 pt-3">
        <span class="text-[11px] text-zinc-500">
          ${formatDate(contest.startTime)}
        </span>

        <a
          href="${escapeHTML(contest.url)}"
          target="_blank"
          rel="noopener noreferrer"
          class="shrink-0 rounded-lg bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-orange-400"
        >
          Open contest ↗
        </a>
      </div>
    </article>
  `;
}

function updateCountdowns() {
  document.querySelectorAll(".countdown").forEach(element => {
    element.textContent = formatCountdown(
      Number(element.dataset.start)
    );
  });

  const nextContest = getFilteredContests()[0];

  nextCountdown.textContent = nextContest
    ? formatCountdown(nextContest.startTime)
    : "--";
}

function renderContests() {
  const filtered = getFilteredContests();

  contestCount.textContent = filtered.length;

  if (filtered.length === 0) {
    contestList.innerHTML = `
      <div class="rounded-xl border border-dashed border-zinc-800 p-6 text-center">
        <p class="text-sm text-zinc-300">No upcoming contests found</p>
        <p class="mt-2 text-xs text-zinc-500">
          Try another search or refresh the schedule.
        </p>
      </div>
    `;
  } else {
    contestList.innerHTML = filtered
      .map(createContestCard)
      .join("");
  }

  updateCountdowns();
}

function setFilter(filter) {
  activeFilter = filter;

  filterButtons.forEach(button => {
    const active = button.dataset.filter === filter;

    button.classList.toggle("bg-white", active);
    button.classList.toggle("text-zinc-950", active);
    button.classList.toggle("font-semibold", active);
    button.classList.toggle("border", !active);
    button.classList.toggle("border-zinc-800", !active);
    button.classList.toggle("text-zinc-400", !active);
  });

  renderContests();
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    setFilter(button.dataset.filter);
  });
});

searchInput.addEventListener("input", renderContests);

async function loadContests() {
  refreshBtn.disabled = true;
  refreshBtn.textContent = "...";

  try {
    const [cachedCodeforces, cachedLeetCode] = await Promise.all([
      getCachedContests(CACHE_KEYS.codeforces),
      getCachedContests(CACHE_KEYS.leetcode)
    ]);

    // Display cached data immediately.
    contests = [...cachedCodeforces, ...cachedLeetCode]
      .filter(contest => contest.startTime > Date.now())
      .sort((a, b) => a.startTime - b.startTime);

    renderContests();

    // Refresh both sources independently.
    const results = await Promise.allSettled([
      fetchCodeforcesContests(),
      fetchLeetCodeContests()
    ]);

    const [codeforcesResult, leetcodeResult] = results;

    let codeforcesContests = cachedCodeforces;
    let leetCodeContests = cachedLeetCode;

    if (codeforcesResult.status === "fulfilled") {
      codeforcesContests = codeforcesResult.value;

      await saveCachedContests(
        CACHE_KEYS.codeforces,
        codeforcesContests
      );
    } else {
      console.error(
        "Codeforces refresh failed:",
        codeforcesResult.reason
      );
    }

    if (leetcodeResult.status === "fulfilled") {
      leetCodeContests = leetcodeResult.value;

      await saveCachedContests(
        CACHE_KEYS.leetcode,
        leetCodeContests
      );
    } else {
      console.error(
        "LeetCode refresh failed:",
        leetcodeResult.reason
      );
    }

    contests = [...codeforcesContests, ...leetCodeContests]
      .filter(contest => contest.startTime > Date.now())
      .sort((a, b) => a.startTime - b.startTime);

    renderContests();

    if (results.every(result => result.status === "fulfilled")) {
      console.log("Both contest sources refreshed successfully.");
    } else {
      console.warn("Some sources are using cached contest data.");
    }
  } catch (error) {
    console.error("Contest loading failed:", error);
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.textContent = "↻";
  }
}

refreshBtn.addEventListener("click", loadContests);

renderContests();
loadContests();

setInterval(updateCountdowns, 1000);
