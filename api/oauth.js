const got = require("got");
const signUp = require("./signUp");
const { OAuth2Client } = require("google-auth-library");

const GOOGLE_CLIENT_ID =
  "1088737867239-ktmhvi9m7p8a54srikk2hl0n0qcn9cdn.apps.googleusercontent.com";
const GOOGLE_SECRET_ID = "FtaPjYhMPDkWxsfCmDbU_CvB";
const FT_CLIENT_ID =
  "d62e491a861a0750d008775f37e08a1ed797d2158f32198039914f0dbddb9590";
const FT_SECRET_ID =
  "6139c30558a59688cdd9c816721841625bf3298377dad7383ae5654921fb7874";
const GITHUB_CLIENT_ID = "f8244955678d6fde727c";
const GITHUB_SECRET_ID = "105ebe5ff14303a3a20cca4bdc35215d6efdc463";

const get42User = async (token) => {
  try {
    return got("https://api.intra.42.fr/v2/me", {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
        "cache-control": "no-cache",
      },
      responseType: "json",
      resolveBodyOnly: true,
    })
      .then((res) => ({ user: res, status: true }))
      .catch((err) => ({ user: null, status: false, msg: err }));
  } catch (err) {
    return { user: null, status: false, msg: err };
  }
};

const oauth42 = async (code) => {
  try {
    return got
      .post("https://api.intra.42.fr/oauth/token", {
        searchParams: {
          code: code,
          client_id: FT_CLIENT_ID,
          client_secret: FT_SECRET_ID,
          grant_type: "authorization_code",
          redirect_uri: `http://localhost:5000/oauth/42`,
        },
        headers: { "Content-Type": "application/json" },
        responseType: "json",
        resolveBodyOnly: true,
      })
      .then(async (result) => {
        const user = await get42User(`Bearer ${result.access_token}`);
        return user.status
          ? await signUp.oauthSignUp({
              username: user.user.login,
              firstname: user.user.first_name,
              lastname: user.user.last_name,
              email: user.user.email,
              photos: user.user.image_url,
            })
          : { status: false, msg: user.msg };
      })
      .catch((err) => ({ status: false, msg: err }));
  } catch (err) {
    return { status: false, msg: err };
  }
};

const getGithubUser = async (token) => {
  try {
    return got("https://api.github.com/user", {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
        "cache-control": "no-cache",
      },
      responseType: "json",
      resolveBodyOnly: true,
    })
      .then((res) => ({ user: res, status: true }))
      .catch((err) => ({ user: null, status: false, msg: err }));
  } catch (err) {
    return { user: null, status: false, msg: err };
  }
};

const oauthGithub = async (code) => {
  try {
    return got
      .post("https://github.com/login/oauth/access_token", {
        searchParams: {
          code: code,
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_SECRET_ID,
          grant_type: "authorization_code",
          state: "test",
          redirect_uri: `http://localhost:5000/oauth/github`,
        },
        headers: { "Content-Type": "application/json" },
        responseType: "json",
        resolveBodyOnly: true,
      })
      .then(async (result) => {
        const user = await getGithubUser(`Bearer ${result.access_token}`);
        if (!user.user.name) user.user.name = user.user.login;
        if (!user.user.email) user.user.email = `${user.user.login}@github.com`;
        return user.status
          ? await signUp.oauthSignUp({
              username: user.user.login,
              firstname: user.user.login,
              lastname: user.user.name,
              email: user.user.email,
              photos: user.user.avatar_url,
            })
          : { status: false, msg: user.msg };
      })
      .catch((err) => ({ status: false, msg: err }));
  } catch (err) {
    return { status: false, msg: err };
  }
};

const getGoogleUser = async (token) => {
  const ticket = await new OAuth2Client(GOOGLE_CLIENT_ID).verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload()
    ? { user: ticket.getPayload(), status: true }
    : { user: null, status: false, msg: "Unable to get user payload" };
};

const oauthGoogle = async (code) => {
  try {
    return got
      .post("https://www.googleapis.com/oauth2/v4/token", {
        searchParams: {
          code: code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_SECRET_ID,
          grant_type: "authorization_code",
          redirect_uri: `http://localhost:5000/oauth/google`,
        },
        headers: { "Content-Type": "application/json" },
        responseType: "json",
        resolveBodyOnly: true,
      })
      .then(async (result) => {
        const user = await getGoogleUser(result.id_token);
        return user.status
          ? await signUp.oauthSignUp({
              username: `${user.user.given_name}-${user.user.family_name}`,
              firstname: user.user.given_name,
              lastname: user.user.family_name,
              email: user.user.email,
              photos: "./src/assets/img/nophotos.png",
            })
          : { status: false, msg: user.msg };
      })
      .catch((err) => ({ status: false, msg: err }));
  } catch (err) {
    return { status: false, msg: err };
  }
};

module.exports = {
  oauthGoogle,
  oauth42,
  oauthGithub,
};
