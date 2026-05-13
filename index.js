// ═══════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════
const TOTAL_SCREENS = 37
const WEB_APP_URL   = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'

let currentScreen = 0
let q9Answer      = ''   // for skip logic
let q13Answer     = ''   // for skip logic
let q22Answer     = ''   // for skip logic
const photoSelected = {}  // {photo-a: 'Image A', ...}

// ═══════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════
function goTo(n) {
  document.getElementById('screen-' + currentScreen).classList.remove('active')
  currentScreen = n
  const next = document.getElementById('screen-' + n)
  next.classList.add('active')
  next.scrollIntoView({ behavior: 'smooth', block: 'start' })
  updateProgress()
}

function startSurvey() {
  document.getElementById('step-counter').style.display = 'block'
  goTo(1)
}

function updateProgress() {
  const pct = Math.round((currentScreen / TOTAL_SCREENS) * 100)
  document.getElementById('progress').style.width = pct + '%'
  document.getElementById('step-current').textContent = Math.max(1, currentScreen)
  document.getElementById('step-total').textContent = TOTAL_SCREENS
}

// ═══════════════════════════════════════════════
//  VALIDATION
// ═══════════════════════════════════════════════
function nextRequired(name, nextScreen) {
  const sel = document.querySelector('input[name="' + name + '"]:checked')
  const err = document.getElementById('err-' + name)
  if (!sel) {
    if (err) { err.classList.add('show') }
    return
  }
  if (err) { err.classList.remove('show') }
  goTo(nextScreen)
}

// ═══════════════════════════════════════════════
//  SKIP LOGIC
// ═══════════════════════════════════════════════
function skipQ9() {
  const sel = document.querySelector('input[name="q9"]:checked')
  const err = document.getElementById('err-q9')
  if (!sel) { if(err) err.classList.add('show'); return }
  if(err) err.classList.remove('show')
  q9Answer = sel.value
  if (q9Answer === 'No') {
    goTo(13)   // skip Q10 + Q11, go to Q12
  } else {
    goTo(12)   // show Q10
  }
}

function goBackFromQ11() {
  // If Q9 was No, go back to Q12 (photo), not Q10
  if (q9Answer === 'No') goTo(14)
  else goTo(12)
}

function skipQ13() {
  const sel = document.querySelector('input[name="q13"]:checked')
  const err = document.getElementById('err-q13')
  if (!sel) { if(err) err.classList.add('show'); return }
  if(err) err.classList.remove('show')
  q13Answer = sel.value
  if (q13Answer === 'No') {
    goTo(17)   // skip Q14
  } else {
    goTo(16)   // show Q14
  }
}

function goBackFromQ15() {
  if (q13Answer === 'No') goTo(15)
  else goTo(16)
}

function skipQ22() {
  const sel = document.querySelector('input[name="q22"]:checked')
  const err = document.getElementById('err-q22')
  if (!sel) { if(err) err.classList.add('show'); return }
  if(err) err.classList.remove('show')
  q22Answer = sel.value
  if (q22Answer === 'Unwilling' || q22Answer === 'Completely unwilling') {
    goTo(28)   // skip Q23
  } else {
    goTo(27)   // show Q23
  }
}

function goBackFromQ24() {
  if (q22Answer === 'Unwilling' || q22Answer === 'Completely unwilling') goTo(26)
  else goTo(27)
}

// ═══════════════════════════════════════════════
//  LIKERT BUTTONS
// ═══════════════════════════════════════════════
function setLikert(name, value, btn) {
  const hidden = document.getElementById(name)
  if (hidden) hidden.value = value
  const parent = btn.closest('.likert-scale')
  if (parent) {
    parent.querySelectorAll('.lk-btn').forEach(b => b.classList.remove('selected'))
  }
  btn.classList.add('selected')
}

// ═══════════════════════════════════════════════
//  PHOTO RECOGNITION
// ═══════════════════════════════════════════════
function togglePhoto(id, label) {
  const el = document.getElementById(id)
  if (el.classList.contains('selected')) {
    el.classList.remove('selected')
    delete photoSelected[id]
  } else {
    el.classList.add('selected')
    photoSelected[id] = label
  }
}

function getPhotoSelections() {
  return Object.values(photoSelected)
}

function getPhotoScore() {
  return Object.keys(photoSelected).length
}

// ═══════════════════════════════════════════════
//  DATA COLLECTION
// ═══════════════════════════════════════════════
function getRadio(name) {
  const el = document.querySelector('input[name="' + name + '"]:checked')
  return el ? el.value : ''
}

function getCheckbox(name) {
  const els = document.querySelectorAll('input[name="' + name + '"]:checked')
  return Array.from(els).map(el => el.value)
}

function getLikert(id) {
  const el = document.getElementById(id)
  return el ? el.value : ''
}

function getText(id) {
  const el = document.getElementById(id)
  return el ? el.value.trim() : ''
}

function computeSum(vals) {
  const nums = vals.map(v => parseInt(v)).filter(n => !isNaN(n))
  return nums.length ? nums.reduce((a,b) => a+b, 0) : ''
}

// ═══════════════════════════════════════════════
//  SUBMIT
// ═══════════════════════════════════════════════
async function submitSurvey() {
  const btn = document.getElementById('submit-btn')
  btn.disabled = true
  btn.textContent = 'Submitting...'

  const q16a = getLikert('q16a'), q16b = getLikert('q16b'),
        q16c = getLikert('q16c'), q16d = getLikert('q16d'),
        q16e = getLikert('q16e')
  const q17a = getLikert('q17a'), q17b = getLikert('q17b'),
        q17c = getLikert('q17c')
  const photos = getPhotoSelections()

  const payload = {
    q1:  getRadio('q1'),
    q2:  getRadio('q2'),
    q3:  getRadio('q3'),
    q4:  getRadio('q4'),
    q5:  getRadio('q5'),
    q6:  getRadio('q6'),
    q7:  getRadio('q7'),
    q8:  getRadio('q8'),
    q9:  getRadio('q9'),
    q10: getCheckbox('q10'),
    q11: getRadio('q11'),
    q12_photoRecognition: photos.concat(getCheckbox('q12')),
    q12_photoScore: getPhotoScore(),
    q13: getRadio('q13'),
    q14: getCheckbox('q14'),
    q15: getRadio('q15'),
    q16a, q16b, q16c, q16d, q16e,
    q16_perceptionScore: computeSum([q16a,q16b,q16c,q16d,q16e]),
    q17a, q17b, q17c,
    q17_neophobiaScore: computeSum([q17a,q17b,q17c]),
    q18: getRadio('q18'),
    q19: getRadio('q19'),
    q20: getRadio('q20'),
    q21: getRadio('q21'),
    q22: getRadio('q22'),
    q23: getCheckbox('q23'),
    q24: getRadio('q24'),
    q25: getRadio('q25'),
    q26: getRadio('q26'),
    q27: getRadio('q27'),
    q28: getRadio('q28'),
    q29: getCheckbox('q29'),
    q30: getRadio('q30'),
    q31: getRadio('q31'),
    q32: getRadio('q32'),
    q33: getLikert('q33'),
    q34: getText('q34')
  }

  try {
    // const res = await fetch(WEB_APP_URL, {
    //   method: 'POST',
    //   body: JSON.stringify(payload)
    // })
    // const result = await res.json()
    // if (result.status === 'success') {
    //   showThankYou()
    // } else {
    //   showErr('Submission failed. Please try again.')
    //   btn.disabled = false
    //   btn.textContent = 'Submit Survey ✓'
    // }
    console.log(payload);
  } catch(e) {
    // For testing without a live endpoint — show thank you anyway
    showThankYou()
  }
}

function showThankYou() {
  document.getElementById('survey-content').style.display = 'none'
  document.getElementById('thank-you-screen').style.display = 'block'
  document.getElementById('progress').style.width = '100%'
  document.getElementById('step-counter').style.display = 'none'
  const ref = 'NIOMR-' + Date.now().toString(36).toUpperCase()
  document.getElementById('ty-ref').textContent = 'Reference: ' + ref
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function showErr(msg) {
  const el = document.getElementById('err-submit')
  if (el) { el.textContent = msg; el.classList.add('show') }
}
s