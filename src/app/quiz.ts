import ky from "ky";
const api = ky.create({ prefixUrl: "https://api.libquest.xyz" });

export const getQuizSession = async (PIN: any) => {
  try {
    const res = await api.get(`getquizsession?join_code=${PIN}`).json();
    console.info("👍", res);
    return { status: 200, res };
  } catch (error) {
    console.warn("👎 PIN not found");
    return { status: 400, pin: PIN };
  }
};
