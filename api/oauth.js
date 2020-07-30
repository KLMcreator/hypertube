const got = require("got");
const signUp = require("./signUp");

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
          client_id:
            "d62e491a861a0750d008775f37e08a1ed797d2158f32198039914f0dbddb9590",
          client_secret:
            "6139c30558a59688cdd9c816721841625bf3298377dad7383ae5654921fb7874",
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
          client_id: "f8244955678d6fde727c",
          client_secret: "105ebe5ff14303a3a20cca4bdc35215d6efdc463",
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

module.exports = {
  oauth42,
  oauthGithub,
};
