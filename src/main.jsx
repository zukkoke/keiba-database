import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import initialRaces from './data/races.json'
import initialHorseProfiles from './data/horseProfiles.json'
import initialFavorites from './data/favorites.json'
import './styles.css'

function loadHorseProfiles() {
  return initialHorseProfiles
}

function loadFavorites() {
  return initialFavorites
}

function loadRaces() {
  return initialRaces
}

function App() {
  const [races, setRaces] = useState(loadRaces)
  const [favorites, setFavorites] = useState(loadFavorites)
  const [horseProfiles, setHorseProfiles] = useState(loadHorseProfiles)
  const [page, setPage] = useState('home')
  const [query, setQuery] = useState('')
  const [selectedHorse, setSelectedHorse] = useState('')
  const [selectedRace, setSelectedRace] = useState(null)

  const horses = useMemo(() => {
    const names = []

    races.forEach(function (race) {
      race.horses.forEach(function (horse) {
        if (
          horse.horse_name &&
          !names.includes(horse.horse_name)
        ) {
          names.push(horse.horse_name)
        }
      })
    })

    return names.sort()
  }, [races])

  const filteredHorses = useMemo(() => {
    const q = query.trim().toLowerCase()

    if (!q) {
      return horses
    }

    return horses.filter(function (horse) {
      return horse.toLowerCase().includes(q)
    })
  }, [query, horses])

  const filteredRaces = useMemo(() => {
    const q = query.trim().toLowerCase()

    if (!q) {
      return races
    }

    return races.filter(function (race) {
      const name = String(race.race_name || '')
      const course = String(race.racecourse || '')
      const number = String(race.race_number || '')

      const searchText =
        name + ' ' + course + ' ' + number

      return searchText.toLowerCase().includes(q)
    })
  }, [query, races])

  const horseRaces = useMemo(() => {
    if (!selectedHorse) {
      return []
    }

    return races.filter(function (race) {
      return race.horses.some(function (horse) {
        return horse.horse_name === selectedHorse
      })
    })
  }, [races, selectedHorse])

  function goHome() {
    setPage('home')
    setQuery('')
    setSelectedHorse('')
    setSelectedRace(null)
  }

  function openHorse(horse) {
    setSelectedHorse(horse)
    setSelectedRace(null)
    setQuery('')
    setPage('horse')
  }

  function openRace(race) {
    setSelectedRace(race)
    setQuery('')
    setPage('race')
  }

  function saveRaces(newRaces) {
    setRaces(newRaces)
  }

  function toggleFavorite(horse) {
    setFavorites(function (prev) {
      if (prev.includes(horse)) {
        return prev.filter(function (name) {
          return name !== horse
        })
      }

      return [...prev, horse]
    })
  }

  function saveHorseProfile(horse, memo) {
    setHorseProfiles(function (prev) {
      return {
        ...prev,
        [horse]: memo
      }
    })
  }

  function exportJson() {
    const json = JSON.stringify(races, null, 2)

    const blob = new Blob(
      [json],
      { type: 'application/json' }
    )

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')

    link.href = url
    link.download = 'races.json'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  function exportFavoritesJson() {
    const json = JSON.stringify(favorites, null, 2)

    const blob = new Blob(
      [json],
      { type: 'application/json' }
    )

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')

    link.href = url
    link.download = 'favorites.json'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  function exportHorseProfilesJson() {
    const json = JSON.stringify(horseProfiles, null, 2)

    const blob = new Blob(
      [json],
      { type: 'application/json' }
    )

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')

    link.href = url
    link.download = 'horseProfiles.json'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  function importJson(event) {
    const file = event.target.files[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = function (e) {
      try {
        const importedRaces = JSON.parse(e.target.result)

        if (!Array.isArray(importedRaces)) {
          throw new Error('データ形式が正しくありません')
        }

        const isValid = importedRaces.every(function (race) {
          return (
            race &&
            race.race_name &&
            Array.isArray(race.horses)
          )
        })

        if (!isValid) {
          throw new Error('KEIBA DATABASEのデータではありません')
        }

        const confirmed = window.confirm(
          '現在のデータを、このraces.jsonの内容で置き換えますか？'
        )

        if (!confirmed) {
          return
        }

        saveRaces(importedRaces)

        alert(
          importedRaces.length +
          'レースを復元しました！'
        )

      } catch (error) {
        alert(
          '読み込みに失敗しました。\n' +
          '正しいraces.jsonを選択してください。'
        )
      }
    }

    reader.readAsText(file)

    event.target.value = ''
  }

  function resetLocalData() {
    const confirmed = window.confirm(
      '現在の画面データを初期状態に戻しますか？'
    )

    if (!confirmed) {
      return
    }

    setRaces(initialRaces)

    alert('初期データに戻しました。')
  }

  return (
    <div className="app">

      <header className="topbar">

        <button
          className="brandButton"
          onClick={goHome}
        >
          <div className="brand">

            <span className="logo">
              🏇
            </span>

            <div>
              <strong>
                KEIBA DATABASE
              </strong>

              <small>
                競馬の記憶を、次の予想へ
              </small>
            </div>

          </div>
        </button>

        <button
          className="adminBtn"
          onClick={function () {
            const password = window.prompt(
              '管理者パスワードを入力してください'
            )

            if (password === 'keiba-admin') {
              setPage('admin')
            } else if (password !== null) {
              window.alert('パスワードが違います。')
            }
          }}
        >
          ⚙ 管理
        </button>

      </header>

      <main>

        {page === 'home' && (
          <Home
            horses={horses}
            races={races}
            favorites={favorites}
            onHorse={function () {
              setQuery('')
              setPage('horseSearch')
            }}
            onFavoriteHorse={function (horse) {
              setSelectedHorse(horse)
              setPage('horse')
            }}
            onRace={function () {
              setQuery('')
              setPage('raceSearch')
            }}
          />
        )}

        {page === 'horseSearch' && (
          <SearchPage
            title="🐎 馬名検索"
            placeholder="馬名を入力してください"
            query={query}
            setQuery={setQuery}
            onBack={goHome}
          >

            <div className="searchResults">

              {filteredHorses.map(function (horse) {
                return (
                  <button
                    className="resultCard"
                    key={horse}
                    onClick={function () {
                      openHorse(horse)
                    }}
                  >

                    <span className="resultIcon">
                      🐎
                    </span>

                    <div>
                      <strong>
                        {horse}
                      </strong>

                      <small>
                        {
                          races.filter(function (race) {
                            return race.horses.some(function (h) {
                              return h.horse_name === horse
                            })
                          }).length
                        } レース
                      </small>
                    </div>

                    <span className="arrow">
                      ›
                    </span>

                  </button>
                )
              })}

              {filteredHorses.length === 0 && (
                <div className="empty">
                  該当する馬がありません。
                </div>
              )}

            </div>

          </SearchPage>
        )}

        {page === 'raceSearch' && (
          <SearchPage
            title="🏇 レース検索"
            placeholder="レース名を入力してください"
            query={query}
            setQuery={setQuery}
            onBack={goHome}
          >

            <div className="searchResults">

              {filteredRaces.map(function (race) {
                return (
                  <button
                    className="resultCard"
                    key={race.id}
                    onClick={function () {
                      openRace(race)
                    }}
                  >

                    <span className="resultIcon">
                      🏇
                    </span>

                    <div>
                      <strong>
                        {race.race_name}
                      </strong>

                      <small>
                        {race.race_date}{'　'}
                        {race.racecourse}{' '}
                        {race.race_number || '-'}R
                      </small>
                    </div>

                    <span className="arrow">
                      ›
                    </span>

                  </button>
                )
              })}

              {filteredRaces.length === 0 && (
                <div className="empty">
                  該当するレースがありません。
                </div>
              )}

            </div>

          </SearchPage>
        )}

        {page === 'horse' && selectedHorse && (
          <HorsePage
            horse={selectedHorse}
            races={horseRaces}
            favorite={favorites.includes(selectedHorse)}
            onFavorite={toggleFavorite}
            horseProfile={horseProfiles[selectedHorse] || ''}
            onSaveProfile={saveHorseProfile}
            onBack={function () {
              setPage('horseSearch')
            }}
            onRace={openRace}
          />
        )}

        {page === 'race' && selectedRace && (
          <RacePage
            race={selectedRace}
            onBack={function () {
              setPage('raceSearch')
            }}
            onHorse={openHorse}
          />
        )}

        {page === 'admin' && (
          <AdminPage
            races={races}
            favorites={favorites}
            horseProfiles={horseProfiles}
            onBack={goHome}
            onSave={saveRaces}
            onExport={exportJson}
            onExportFavorites={exportFavoritesJson}
            onExportHorseProfiles={exportHorseProfilesJson}
            onImport={importJson}
            onReset={resetLocalData}
          />
        )}

      </main>

      <footer>
        KEIBA DATABASE · Public view
      </footer>

    </div>
  )
}


/* =========================
   Home
========================= */

function Home(props) {
  return (
    <section className="home">

      <div className="hero homeHero">

        <p className="eyebrow">
          RACE MEMORY
        </p>

        <h1>
          競馬の記憶を、
          <br />
          <span>次の予想へ。</span>
        </h1>

        <p className="lead">
          馬の過去レースと、レースそのものの記憶を
          まとめて確認できるデータベース。
        </p>

      </div>

      <div className="homeActions">

        <button
          className="mainChoice horseChoice"
          onClick={props.onHorse}
        >

          <span className="choiceIcon">
            🐎
          </span>

          <div>
            <strong>
              馬名を検索
            </strong>

            <small>
              馬の過去レース情報を見る
            </small>
          </div>

          <span className="arrow">
            ›
          </span>

        </button>

        <button
          className="mainChoice raceChoice"
          onClick={props.onRace}
        >

          <span className="choiceIcon">
            🏇
          </span>

          <div>
            <strong>
              レース名を検索
            </strong>

            <small>
              レースの状況・出走馬を見る
            </small>
          </div>

          <span className="arrow">
            ›
          </span>

        </button>

      </div>

      {props.favorites.length > 0 && (
        <div className="favoriteSection">

          <div className="sectionHead">

            <div>
              <p className="eyebrow">
                FAVORITES
              </p>

              <h2>
                ⭐ お気に入り馬
              </h2>
            </div>

            <span>
              {props.favorites.length}頭
            </span>

          </div>

          <div className="favoriteList">

            {props.favorites.map(function (horse) {

              return (
                <button
                  className="favoriteHorse"
                  key={horse}
                  onClick={function () {
                    props.onFavoriteHorse(horse)
                  }}
                >

                  <span>
                    ★
                  </span>

                  <strong>
                    {horse}
                  </strong>

                  <span className="arrow">
                    ›
                  </span>

                </button>
              )
            })}

          </div>

        </div>
      )}

      <div className="stats homeStats">

        <div>
          <b>
            {props.horses.length}
          </b>

          <span>
            登録競走馬
          </span>
        </div>

        <div>
          <b>
            {props.races.length}
          </b>

          <span>
            登録レース
          </span>
        </div>

      </div>

    </section>
  )
}


/* =========================
   Search
========================= */

function SearchPage(props) {
  return (
    <section className="content searchPage">

      <button
        className="backButton"
        onClick={props.onBack}
      >
        ← トップへ戻る
      </button>

      <div className="sectionHead">

        <div>

          <p className="eyebrow">
            SEARCH
          </p>

          <h2>
            {props.title}
          </h2>

        </div>

      </div>

      <div className="searchPanel">

        <div className="searchBox">

          <span>
            ⌕
          </span>

          <input
            autoFocus
            value={props.query}
            onChange={function (e) {
              props.setQuery(e.target.value)
            }}
            placeholder={props.placeholder}
          />

        </div>

      </div>

      {props.children}

    </section>
  )
}


/* =========================
   Horse
========================= */

function HorsePage(props) {

  const [profileMemo, setProfileMemo] = useState(
    props.horseProfile
  )

  const sortedRaces = [...props.races].sort(
    function (a, b) {
      return String(b.race_date).localeCompare(
        String(a.race_date)
      )
    }
  )

  return (
    <section className="content">

      <button
        className="backButton"
        onClick={props.onBack}
      >
        ← 馬検索へ戻る
      </button>

      <div className="detailHeader">

        <p className="eyebrow">
          HORSE HISTORY
        </p>

        <h2>
          🐎 {props.horse}
        </h2>

        <button
          className={
            props.favorite
              ? 'favoriteButton active'
              : 'favoriteButton'
          }
          onClick={function () {
            props.onFavorite(props.horse)
          }}
        >
          {props.favorite
            ? '★ お気に入り'
            : '☆ お気に入り登録'}
        </button>

        <div className="horseProfile">

          <div className="horseProfileHeader">

            <div>
              <p className="eyebrow">
                HORSE PROFILE
              </p>

              <h3>
                📝 馬の特徴・メモ
              </h3>
            </div>

          </div>

          <textarea
            value={profileMemo}
            onChange={function (event) {
              setProfileMemo(event.target.value)
            }}
            placeholder="この馬の特徴や評価をメモ..."
            rows="5"
          />

          <button
            className="profileSaveButton"
            onClick={function () {
              props.onSaveProfile(
                props.horse,
                profileMemo
              )
            }}
          >
            メモを保存
          </button>

        </div>

        <span>
          {props.races.length} records
        </span>

      </div>

      <div className="raceList">

        {sortedRaces.map(function (race) {

          const result = race.horses.find(
            function (horse) {
              return horse.horse_name === props.horse
            }
          )

          return (
            <article
              className="raceCard"
              key={race.id}
            >

              <button
                className="raceLink"
                onClick={function () {
                  props.onRace(race)
                }}
              >

                <div className="raceTop">

                  <div>

                    <span className="date">
                      {race.race_date}
                    </span>

                    <h3>
                      {race.race_name}
                    </h3>

                    <small>
                      {race.racecourse}{' '}
                      {race.race_number || '-'}R
                    </small>

                  </div>

                  <div className="finish">

                    {result && result.finish
                      ? String(result.finish) + '着'
                      : '未出走'}

                  </div>

                </div>

              </button>

              <div className="tags">

                <span>
                  {race.course || '-'}
                </span>

                <span>
                  {race.distance
                    ? String(race.distance) + 'm'
                    : '-'}
                </span>

                <span>
                  ペース：{race.pace || '-'}
                </span>

                <span>
                  馬場：{race.ground || '-'}
                </span>

                <span>
                  バイアス：{race.bias || '-'}
                </span>

                <span>
                  斤量：
                  {result && result.weight
                    ? String(result.weight)
                    : '-'}kg
                </span>

                <span>
                  騎手：
                  {result && result.jockey
                    ? result.jockey
                    : '-'}
                </span>

              </div>

              <p>
                {result && result.memo
                  ? result.memo
                  : '馬メモなし'}
              </p>

            </article>
          )
        })}

      </div>

    </section>
  )
}


/* =========================
   Race
========================= */

function RacePage(props) {
  const race = props.race

  const sortedHorses = [...race.horses].sort(
    function (a, b) {
      const finishA = a.finish || 999
      const finishB = b.finish || 999

      return finishA - finishB
    }
  )

  return (
    <section className="content">

      <button
        className="backButton"
        onClick={props.onBack}
      >
        ← レース検索へ戻る
      </button>

      <div className="raceDetail">

        <div className="detailHeader">

          <p className="eyebrow">
            RACE DETAIL
          </p>

          <h2>
            {race.race_name}
          </h2>

          <span>
            {race.race_date}{'　'}
            {race.racecourse}{' '}
            {race.race_number || '-'}R
          </span>

        </div>

        <div className="raceInfo">

          <div>
            <small>コース</small>
            <strong>
              {race.course || '-'}
            </strong>
          </div>

          <div>
            <small>距離</small>
            <strong>
              {race.distance
                ? String(race.distance) + 'm'
                : '-'}
            </strong>
          </div>

          <div>
            <small>天候</small>
            <strong>
              {race.weather || '-'}
            </strong>
          </div>

          <div>
            <small>馬場</small>
            <strong>
              {race.ground || '-'}
            </strong>
          </div>

          <div>
            <small>ペース</small>
            <strong>
              {race.pace || '-'}
            </strong>
          </div>

          <div>
            <small>馬場バイアス</small>
            <strong>
              {race.bias || '-'}
            </strong>
          </div>

        </div>

        <div className="memoBox">

          <p className="eyebrow">
            RACE MEMO
          </p>

          <p>
            {race.race_memo || 'レースメモなし'}
          </p>

        </div>

        <div className="sectionHead">

          <div>

            <p className="eyebrow">
              RUNNERS
            </p>

            <h2>
              出走馬
            </h2>

          </div>

          <span>
            {race.horses.length} horses
          </span>

        </div>

        <div className="runnerList">

          {sortedHorses.map(function (horse) {

            return (
              <article
                className="runnerCard"
                key={
                  String(race.id) +
                  '-' +
                  String(horse.horse_name)
                }
              >

                <div className="runnerFinish">

                  {horse.finish || '-'}

                  <small>
                    着
                  </small>

                </div>

                <button
                  className="runnerName"
                  onClick={function () {
                    props.onHorse(horse.horse_name)
                  }}
                >

                  <div>

                    <strong>
                      {horse.frame || '-'}枠{'　'}
                      {horse.number || '-'}番
                    </strong>

                    <strong>
                      {horse.horse_name}
                    </strong>

                  </div>

                  <span>
                    {horse.jockey || '-'}{'　'}
                    {horse.weight
                      ? String(horse.weight)
                      : '-'}kg
                  </span>

                </button>

                <p>
                  {horse.memo || '馬メモなし'}
                </p>

              </article>
            )
          })}

        </div>

      </div>

    </section>
  )
}


/* =========================
   Admin
========================= */

function AdminPage(props) {

  const emptyHorse = {
    frame: '',
    number: '',
    horse_name: '',
    jockey: '',
    weight: '',
    finish: '',
    memo: ''
  }

  const [raceDate, setRaceDate] = useState('')
  const [racecourse, setRacecourse] = useState('')
  const [raceNumber, setRaceNumber] = useState('')
  const [raceName, setRaceName] = useState('')
  const [course, setCourse] = useState('芝')
  const [distance, setDistance] = useState('')
  const [weather, setWeather] = useState('')
  const [ground, setGround] = useState('')
  const [pace, setPace] = useState('')
  const [bias, setBias] = useState('')
  const [raceMemo, setRaceMemo] = useState('')

  const [horses, setHorses] = useState([
    { ...emptyHorse }
  ])

  // 登録済みレース検索
  const [registeredRaceQuery, setRegisteredRaceQuery] = useState('')
  const [registeredRaceDate, setRegisteredRaceDate] = useState('')
  const [registeredRacecourse, setRegisteredRacecourse] = useState('')

  function addHorse() {
    setHorses(function (prev) {
      return [
        ...prev,
        { ...emptyHorse }
      ]
    })
  }

  function removeHorse(index) {
    setHorses(function (prev) {
      return prev.filter(function (_, i) {
        return i !== index
      })
    })
  }

  function updateHorse(index, field, value) {
    setHorses(function (prev) {
      return prev.map(function (horse, i) {

        if (i !== index) {
          return horse
        }

        return {
          ...horse,
          [field]: value
        }
      })
    })
  }

  function saveRace() {

    if (
      !raceDate ||
      !racecourse ||
      !raceName
    ) {
      alert(
        '開催日・競馬場・レース名は入力してください。'
      )
      return
    }

    const validHorses = horses.filter(
      function (horse) {
        return horse.horse_name.trim() !== ''
      }
    )

    if (validHorses.length === 0) {
      alert(
        '出走馬を1頭以上入力してください。'
      )
      return
    }

    const newRace = {
      id: Date.now(),

      race_date: raceDate,
      race_name: raceName,
      racecourse: racecourse,
      race_number: Number(raceNumber) || '',

      course: course,
      distance: Number(distance) || '',
      weather: weather,
      ground: ground,
      pace: pace,
      bias: bias,
      race_memo: raceMemo,

      horses: validHorses.map(function (horse) {
        return {
          frame: Number(horse.frame) || '',
          number: Number(horse.number) || '',
          horse_name: horse.horse_name,
          jockey: horse.jockey,
          weight: Number(horse.weight) || '',
          finish: Number(horse.finish) || '',
          memo: horse.memo
        }
      })
    }

    const newRaces = [
      ...props.races,
      newRace
    ]

    props.onSave(newRaces)

    alert('レースを保存しました！')

    setRaceDate('')
    setRacecourse('')
    setRaceNumber('')
    setRaceName('')
    setCourse('芝')
    setDistance('')
    setWeather('')
    setGround('')
    setPace('')
    setBias('')
    setRaceMemo('')
    setHorses([
      { ...emptyHorse }
    ])
  }

  // レース1件削除
  function deleteRace(raceId) {

    const race = props.races.find(function (item) {
      return item.id === raceId
    })

    if (!race) {
      return
    }

    const confirmed = window.confirm(
      '「' +
      race.race_name +
      '」を削除しますか？\n\n' +
      'このレースに登録されている出走馬もすべて削除されます。'
    )

    if (!confirmed) {
      return
    }

    const newRaces = props.races.filter(
      function (item) {
        return item.id !== raceId
      }
    )

    props.onSave(newRaces)

    alert('レースを削除しました。')
  }

  // レース内の馬1頭削除
  function deleteRegisteredHorse(raceId, horseIndex) {

    const race = props.races.find(function (item) {
      return item.id === raceId
    })

    if (!race) {
      return
    }

    const horse = race.horses[horseIndex]

    if (!horse) {
      return
    }

    const confirmed = window.confirm(
      '「' +
      horse.horse_name +
      '」をこのレースから削除しますか？'
    )

    if (!confirmed) {
      return
    }

    const newHorses = race.horses.filter(
      function (_, index) {
        return index !== horseIndex
      }
    )

    const newRaces = props.races.map(
      function (item) {

        if (item.id !== raceId) {
          return item
        }

        return {
          ...item,
          horses: newHorses
        }
      }
    )

    props.onSave(newRaces)

    alert(
      horse.horse_name +
      'をレースから削除しました。'
    )
  }

  // 登録済みレースを検索
  const filteredRegisteredRaces = props.races.filter(
    function (race) {

      const query = registeredRaceQuery
        .trim()
        .toLowerCase()

      const raceText = (
        String(race.race_name || '') +
        ' ' +
        String(race.racecourse || '') +
        ' ' +
        String(race.race_number || '')
      ).toLowerCase()

      const matchesQuery =
        !query ||
        raceText.includes(query)

      const matchesDate =
        !registeredRaceDate ||
        String(race.race_date || '') === registeredRaceDate

      const matchesCourse =
        !registeredRacecourse ||
        String(race.racecourse || '')
          .toLowerCase()
          .includes(
            registeredRacecourse.trim().toLowerCase()
          )

      return (
        matchesQuery &&
        matchesDate &&
        matchesCourse
      )
    }
  )

  const hasRegisteredRaceFilter =
    registeredRaceQuery.trim() !== '' ||
    registeredRaceDate !== '' ||
    registeredRacecourse.trim() !== ''

  function clearRegisteredRaceSearch() {
    setRegisteredRaceQuery('')
    setRegisteredRaceDate('')
    setRegisteredRacecourse('')
  }

  return (
    <section className="content adminPage">

      <button
        className="backButton"
        onClick={props.onBack}
      >
        ← トップへ戻る
      </button>

      <div className="detailHeader">

        <p className="eyebrow">
          ADMIN
        </p>

        <h2>
          レースデータ管理
        </h2>

        <span>
          現在 {props.races.length} レース登録
        </span>

      </div>


      {/* =========================
          レース登録
      ========================= */}

      <div className="adminCard">

        <h3>
          レース情報
        </h3>

        <div className="adminGrid">

          <label>
            開催日

            <input
              type="date"
              value={raceDate}
              onChange={function (e) {
                setRaceDate(e.target.value)
              }}
            />
          </label>

          <label>
            競馬場

            <input
              value={racecourse}
              onChange={function (e) {
                setRacecourse(e.target.value)
              }}
              placeholder="中山"
            />
          </label>

          <label>
            レース番号

            <input
              type="number"
              value={raceNumber}
              onChange={function (e) {
                setRaceNumber(e.target.value)
              }}
              placeholder="11"
            />
          </label>

          <label>
            レース名

            <input
              value={raceName}
              onChange={function (e) {
                setRaceName(e.target.value)
              }}
              placeholder="スプリンターズS"
            />
          </label>

          <label>
            コース

            <select
              value={course}
              onChange={function (e) {
                setCourse(e.target.value)
              }}
            >
              <option value="芝">
                芝
              </option>

              <option value="ダート">
                ダート
              </option>
            </select>
          </label>

          <label>
            距離

            <input
              type="number"
              value={distance}
              onChange={function (e) {
                setDistance(e.target.value)
              }}
              placeholder="1200"
            />
          </label>

          <label>
            天候

            <input
              value={weather}
              onChange={function (e) {
                setWeather(e.target.value)
              }}
              placeholder="晴"
            />
          </label>

          <label>
            馬場

            <input
              value={ground}
              onChange={function (e) {
                setGround(e.target.value)
              }}
              placeholder="稍重"
            />
          </label>

          <label>
            ペース

            <input
              value={pace}
              onChange={function (e) {
                setPace(e.target.value)
              }}
              placeholder="ハイ"
            />
          </label>

          <label>
            馬場バイアス

            <input
              value={bias}
              onChange={function (e) {
                setBias(e.target.value)
              }}
              placeholder="前有利"
            />
          </label>

        </div>

        <label className="fullField">
          レースメモ

          <textarea
            value={raceMemo}
            onChange={function (e) {
              setRaceMemo(e.target.value)
            }}
            rows="4"
            placeholder="レース全体についてのメモ"
          />

        </label>

      </div>


      {/* =========================
          出走馬登録
      ========================= */}

      <div className="adminCard">

        <div className="adminCardHeader">

          <h3>
            出走馬
          </h3>

          <button
            type="button"
            className="secondaryBtn"
            onClick={addHorse}
          >
            ＋ 出走馬を追加
          </button>

        </div>

        <div className="adminHorseList">

          {horses.map(function (horse, index) {

            return (
              <div
                className="adminHorse"
                key={index}
              >

                <div className="adminHorseHeader">

                  <strong>
                    {index + 1}頭目
                  </strong>

                  {horses.length > 1 && (
                    <button
                      type="button"
                      className="deleteBtn"
                      onClick={function () {
                        removeHorse(index)
                      }}
                    >
                      削除
                    </button>
                  )}

                </div>

                <div className="adminGrid horseGrid">

                  <label>
                    枠番

                    <input
                      type="number"
                      value={horse.frame}
                      onChange={function (e) {
                        updateHorse(
                          index,
                          'frame',
                          e.target.value
                        )
                      }}
                    />
                  </label>

                  <label>
                    馬番

                    <input
                      type="number"
                      value={horse.number}
                      onChange={function (e) {
                        updateHorse(
                          index,
                          'number',
                          e.target.value
                        )
                      }}
                    />
                  </label>

                  <label className="horseNameField">
                    馬名

                    <input
                      value={horse.horse_name}
                      onChange={function (e) {
                        updateHorse(
                          index,
                          'horse_name',
                          e.target.value
                        )
                      }}
                      placeholder="サヴォアテール"
                    />
                  </label>

                  <label>
                    騎手

                    <input
                      value={horse.jockey}
                      onChange={function (e) {
                        updateHorse(
                          index,
                          'jockey',
                          e.target.value
                        )
                      }}
                      placeholder="○○"
                    />
                  </label>

                  <label>
                    斤量

                    <input
                      type="number"
                      step="0.5"
                      value={horse.weight}
                      onChange={function (e) {
                        updateHorse(
                          index,
                          'weight',
                          e.target.value
                        )
                      }}
                      placeholder="55"
                    />
                  </label>

                  <label>
                    着順

                    <input
                      type="number"
                      value={horse.finish}
                      onChange={function (e) {
                        updateHorse(
                          index,
                          'finish',
                          e.target.value
                        )
                      }}
                      placeholder="5"
                    />
                  </label>

                </div>

                <label className="fullField">
                  馬メモ

                  <textarea
                    value={horse.memo}
                    onChange={function (e) {
                      updateHorse(
                        index,
                        'memo',
                        e.target.value
                      )
                    }}
                    rows="3"
                    placeholder="この馬についてのメモ"
                  />

                </label>

              </div>
            )
          })}

        </div>

      </div>


      {/* =========================
          保存・JSON
      ========================= */}

      <div className="adminActions">

        <button
          type="button"
          className="primary adminSaveBtn"
          onClick={saveRace}
        >
          💾 このレースを保存
        </button>

        <button
          type="button"
          className="secondaryBtn"
          onClick={props.onExport}
        >
          📥 races.jsonを書き出す
        </button>

        <label className="secondaryBtn importButton">
          📤 races.jsonを読み込む

          <input
            type="file"
            accept=".json,application/json"
            onChange={props.onImport}
            hidden
          />
        </label>

        <button
          type="button"
          className="secondaryBtn resetBtn"
          onClick={props.onReset}
        >
          🔄 初期データに戻す
        </button>

        <button
          type="button"
          className="secondaryBtn"
          onClick={props.onExportFavorites}
        >
          ⭐ お気に入りを書き出す
        </button>

        <button
          type="button"
          className="secondaryBtn"
          onClick={props.onExportHorseProfiles}
        >
          📝 馬プロフィールを書き出す
        </button>

      </div>


      {/* =========================
          登録済みレース
      ========================= */}

      <div className="adminCard">

        <div className="adminCardHeader">

          <div>

            <h3>
              登録済みレース
            </h3>

            <span>
              {props.races.length} レース登録
            </span>

          </div>

          {hasRegisteredRaceFilter && (
            <button
              type="button"
              className="secondaryBtn"
              onClick={clearRegisteredRaceSearch}
            >
              検索をクリア
            </button>
          )}

        </div>


        {/* レース検索 */}

        <div className="registeredRaceSearch">

          <label>
            レース名・競馬場・番号

            <input
              value={registeredRaceQuery}
              onChange={function (e) {
                setRegisteredRaceQuery(
                  e.target.value
                )
              }}
              placeholder="例：スプリンターズS / 中山 / 11"
            />
          </label>

          <label>
            開催日

            <input
              type="date"
              value={registeredRaceDate}
              onChange={function (e) {
                setRegisteredRaceDate(
                  e.target.value
                )
              }}
            />
          </label>

          <label>
            競馬場

            <input
              value={registeredRacecourse}
              onChange={function (e) {
                setRegisteredRacecourse(
                  e.target.value
                )
              }}
              placeholder="中山"
            />
          </label>

        </div>


        <div className="registeredRaceSearchResult">

          {props.races.length > 0 && (
            <p>
              {filteredRegisteredRaces.length} / {props.races.length} レース表示
            </p>
          )}

        </div>


        {props.races.length === 0 ? (

          <div className="empty">
            登録されているレースはありません。
          </div>

        ) : filteredRegisteredRaces.length === 0 ? (

          <div className="empty">
            条件に一致するレースがありません。
          </div>

        ) : (

          <div className="registeredRaceList">

            {filteredRegisteredRaces.map(function (race) {

              return (
                <details
                  className="registeredRace"
                  key={race.id}
                >

                  <summary>

                    <div>

                      <strong>
                        {race.race_date}{'　'}
                        {race.racecourse}{' '}
                        {race.race_number || '-'}R
                      </strong>

                      <span>
                        {race.race_name}
                      </span>

                    </div>

                    <span>
                      {race.horses.length}頭
                    </span>

                  </summary>


                  <div className="registeredRaceBody">

                    <div className="registeredRaceInfo">

                      <span>
                        {race.course || '-'}
                      </span>

                      <span>
                        {race.distance
                          ? String(race.distance) + 'm'
                          : '-'}
                      </span>

                      <span>
                        天候：{race.weather || '-'}
                      </span>

                      <span>
                        馬場：{race.ground || '-'}
                      </span>

                      <span>
                        ペース：{race.pace || '-'}
                      </span>

                      <span>
                        バイアス：{race.bias || '-'}
                      </span>

                    </div>


                    <button
                      type="button"
                      className="deleteBtn"
                      onClick={function () {
                        deleteRace(race.id)
                      }}
                    >
                      🗑️ このレースを削除
                    </button>


                    <div className="registeredHorseList">

                      {race.horses.length === 0 ? (

                        <div className="empty">
                          出走馬が登録されていません。
                        </div>

                      ) : (

                        race.horses.map(
                          function (horse, index) {

                            return (
                              <div
                                className="registeredHorse"
                                key={
                                  String(race.id) +
                                  '-' +
                                  String(index)
                                }
                              >

                                <div>

                                  <strong>
                                    {horse.frame || '-'}枠{'　'}
                                    {horse.number || '-'}番{'　'}
                                    {horse.horse_name}
                                  </strong>

                                  <small>
                                    {horse.jockey || '-'}{'　'}

                                    {horse.weight
                                      ? String(horse.weight) + 'kg'
                                      : '-'}{'　'}

                                    {horse.finish
                                      ? String(horse.finish) + '着'
                                      : '-'}
                                  </small>

                                </div>

                                <button
                                  type="button"
                                  className="deleteBtn"
                                  onClick={function () {
                                    deleteRegisteredHorse(
                                      race.id,
                                      index
                                    )
                                  }}
                                >
                                  🗑️ 馬を削除
                                </button>

                              </div>
                            )
                          }
                        )

                      )}

                    </div>

                  </div>

                </details>
              )
            })}

          </div>

        )}

      </div>


      <div className="adminNotice">

        <strong>
          現在の保存について
        </strong>

        <p>
          この画面での変更は、このブラウザを開いている間だけ反映されます。
          共有データとして保存する場合は、JSONを書き出してGitHubのファイルを更新してください。
        </p>

      </div>

    </section>
  )
}


createRoot(document.getElementById('root')).render(
  <App />
)