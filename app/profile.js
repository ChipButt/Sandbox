import {
  auth,
  db,
  googleProvider,
  dom,
  state,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  deleteUser,
  updateProfile,
  doc,
  setDoc,
  serverTimestamp,
  runTransaction,
  validateUsername,
  parseTrailReason,
  setAuthButtonsDisabled
} from "./core.js";
import { showStatus, clearStatus } from "./ui.js";

const LAST_EMAIL_KEY = "rrLastEmail";
const LAST_DISPLAY_NAME_KEY = "rrDisplayName";
const LAST_REASON_KEY = "rrLastReason";

export function setAuthMode(mode = "login") {
  const isCreate = mode === "create";

  if (dom.authFormShell) {
    dom.authFormShell.classList.toggle("auth-mode-create", isCreate);
    dom.authFormShell.classList.toggle("auth-mode-login", !isCreate);
  }

  if (dom.authTitle) {
    dom.authTitle.textContent = isCreate ? "Create Account" : "Log In";
  }

  if (dom.authCopy) {
    dom.authCopy.textContent = isCreate
      ? "Create your account once and the app can remember you on this device."
      : "Log in to reopen your restoration record. New here? Tap create account.";
  }

  if (dom.createOnlyFields) {
    dom.createOnlyFields.classList.toggle("hidden", !isCreate);
  }

  if (dom.signUpBtn) dom.signUpBtn.parentElement.classList.toggle("hidden", !isCreate);
  if (dom.logInBtn) dom.logInBtn.parentElement.classList.toggle("hidden", isCreate);

}

function rememberAuthInputs() {
  try {
    if (dom.emailInput?.value?.trim()) {
      localStorage.setItem(LAST_EMAIL_KEY, dom.emailInput.value.trim());
    }
    if (dom.usernameInput?.value?.trim()) {
      localStorage.setItem(LAST_DISPLAY_NAME_KEY, dom.usernameInput.value.trim());
    }
    if (dom.trailReasonSelect?.value) {
      localStorage.setItem(LAST_REASON_KEY, dom.trailReasonSelect.value);
    }
  } catch {}
}

export function primeRememberedAuthFields() {
  try {
    const savedEmail = localStorage.getItem(LAST_EMAIL_KEY) || "";
    const savedName = localStorage.getItem(LAST_DISPLAY_NAME_KEY) || "";
    const savedReason = localStorage.getItem(LAST_REASON_KEY) || "";

    if (savedEmail && dom.emailInput && !dom.emailInput.value.trim()) {
      dom.emailInput.value = savedEmail;
    }
    if (savedName && dom.usernameInput && !dom.usernameInput.value.trim()) {
      dom.usernameInput.value = savedName;
    }
    if (savedReason && dom.trailReasonSelect && !dom.trailReasonSelect.value) {
      dom.trailReasonSelect.value = savedReason;
    }
  } catch {}
}

export function initAuthUi() {
  primeRememberedAuthFields();
  setAuthMode("login");
}

export async function reserveUsernameForUser(user, rawUsername, rawReasonValue = null) {
  const { clean, lower } = validateUsername(rawUsername);

  let reasonToStore = null;
  if (rawReasonValue) {
    reasonToStore = parseTrailReason(rawReasonValue);
  }

  const userRef = doc(db, "userVisits", user.uid);
  const usernameRef = doc(db, "usernames", lower);
  const leaderboardRef = doc(db, "leaderboard", user.uid);

  await runTransaction(db, async (transaction) => {
    const usernameSnap = await transaction.get(usernameRef);
    const userSnap = await transaction.get(userRef);

    const existingUserData = userSnap.exists() ? userSnap.data() : {};
    const oldLower = typeof existingUserData.usernameLower === "string" ? existingUserData.usernameLower : null;
    const existingCompleted = Number.isFinite(existingUserData.completedVehicles)
      ? existingUserData.completedVehicles
      : state.currentCompletedVehicles;

    if (usernameSnap.exists()) {
      const ownerUid = usernameSnap.data()?.uid;
      if (ownerUid !== user.uid) {
        throw new Error("That display name has already been used.");
      }
    }

    if (oldLower && oldLower !== lower) {
      const oldUsernameRef = doc(db, "usernames", oldLower);
      transaction.delete(oldUsernameRef);
    }

    transaction.set(
      usernameRef,
      {
        uid: user.uid,
        username: clean,
        usernameLower: lower,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    const userDataToMerge = {
      username: clean,
      usernameLower: lower,
      displayName: clean,
      isRegistered: !user.isAnonymous,
      updatedAt: serverTimestamp()
    };

    if (reasonToStore) {
      userDataToMerge.trailReasonKey = reasonToStore.key;
      userDataToMerge.trailReasonLabel = reasonToStore.label;
    }

    transaction.set(userRef, userDataToMerge, { merge: true });

    transaction.set(
      leaderboardRef,
      {
        uid: user.uid,
        username: clean,
        usernameLower: lower,
        completedVehicles: existingCompleted,
        updatedAt: serverTimestamp(),
        isRegistered: !user.isAnonymous
      },
      { merge: true }
    );
  });

  try {
    await updateProfile(user, { displayName: clean });
  } catch {}

  state.currentUsername = clean;
  state.currentUsernameLower = lower;

  if (reasonToStore) {
    state.currentTrailReasonKey = reasonToStore.key;
    state.currentTrailReasonLabel = reasonToStore.label;
  }

  rememberAuthInputs();
}

export async function createRegisteredAccount() {
  const email = dom.emailInput.value.trim();
  const password = dom.passwordInput.value.trim();
  const username = dom.usernameInput.value;
  const trailReason = dom.trailReasonSelect.value;
  rememberAuthInputs();

  if (!email || !password || !username) {
    throw new Error("Enter a display name, email, and password.");
  }

  validateUsername(username);
  parseTrailReason(trailReason);

  let createdUser = null;

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    createdUser = cred.user;
    await reserveUsernameForUser(createdUser, username, trailReason);
  } catch (error) {
    if (createdUser) {
      try {
        await deleteUser(createdUser);
      } catch {}
    }
    throw error;
  }
}

export async function signUpFlow() {
  if (state.authBusy) return;
  state.authBusy = true;
  setAuthButtonsDisabled(true);
  clearStatus();

  try {
    await createRegisteredAccount();
    rememberAuthInputs();
    showStatus("Account created successfully.", "success");
  } catch (error) {
    showStatus(error.message || "Could not create account.", "error");
  } finally {
    state.authBusy = false;
    setAuthButtonsDisabled(false);
  }
}

export async function logInFlow() {
  if (state.authBusy) return;
  state.authBusy = true;
  setAuthButtonsDisabled(true);
  clearStatus();

  const email = dom.emailInput.value.trim();
  const password = dom.passwordInput.value.trim();

  if (!email || !password) {
    showStatus("Enter both email and password.", "error");
    state.authBusy = false;
    setAuthButtonsDisabled(false);
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    rememberAuthInputs();
    showStatus("Logged in successfully.", "success");
  } catch (error) {
    const code = String(error?.code || "");
    if (code.includes("invalid") || code.includes("not-found") || code.includes("user-disabled")) {
      setAuthMode("create");
      showStatus("That login was not recognised. Create an account below.", "info", 4500);
    } else {
      showStatus(error.message || "Could not log in.", "error");
    }
  } finally {
    state.authBusy = false;
    setAuthButtonsDisabled(false);
  }
}

export async function googleFlow() {
  if (state.authBusy) return;
  state.authBusy = true;
  setAuthButtonsDisabled(true);
  clearStatus();

  try {
    await signInWithPopup(auth, googleProvider);
    rememberAuthInputs();
    showStatus("Signed in with Google.", "success");
  } catch (error) {
    showStatus(error.message || "Could not sign in with Google.", "error");
  } finally {
    state.authBusy = false;
    setAuthButtonsDisabled(false);
  }
}

