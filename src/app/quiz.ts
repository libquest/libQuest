import ky from "ky";
const api = ky.create({ prefixUrl: "https://api.libquest.xyz" });

export const getQuizSession = async (PIN) => {
  try {
    const res = await api.get(`getquizsession?join_code=${PIN}`).json();
    console.info("👍", res);
    return { status: 200, res };
  } catch (error) {
    const serverMessage = await error.response.text();
    console.warn("👎", serverMessage);
    return { status: 400, pin: PIN };
  }
};
