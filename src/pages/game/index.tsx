import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import LoadingBar from "react-top-loading-bar";
import tw from "twin.macro";
import Link from "next/link";

import { getVersion } from "app/api";
import { getQuizSession } from "app/quiz";

import Loading from "components/Loading";
import Navbar from "components/Navbar";

const GameIndex: React.FC = () => {
  const { data: versionData, isLoading } = useQuery<VersionData>("version", getVersion);
  const [progress, setProgress] = useState(0);
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    if (isLoading) {
      setProgress(20);
      setTimeout(function () {
        setProgress(100);
      }, 500);
    }
  }, []);

  const handleSubmit = (event) => {
    const formData = new FormData(event.currentTarget);
    event.preventDefault();
    for (let [key, value] of formData.entries()) {
      getQuizSession(value).then((data) => {
        setQuiz(data);
      });
    }
  };

  return (
    <div css={tw`relative`}>
      <LoadingBar color="#1A56DB" progress={progress} onLoaderFinished={() => setProgress(0)} />
      <div css={tw`flex flex-col justify-center items-center w-screen h-screen`}>
        <h5 css={tw`mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white`}>libQuest</h5>
        <div css={tw`p-6 w-80 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700`}>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="pin"
              placeholder="Game PIN"
              css={tw`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4 dark:bg-gray-600 dark:border-gray-500 placeholder-gray-400 dark:text-white placeholder:text-xl mb-3 transition placeholder:text-center placeholder:font-bold font-bold text-xl text-center`}
              required
            />

            <button
              css={[
                tw`text-center w-full block py-2 px-3 text-base font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition cursor-pointer`,
                isLoading && tw`opacity-90 cursor-default pointer-events-none`,
              ]}
              type="submit"
            >
              Enter lobby!
            </button>
          </form>
        </div>
        <span css={tw`font-normal text-gray-400 mt-2 text-xs`}>{versionData?.version}</span>
        {quiz?.status === 400 && <span css={tw`font-normal text-gray-400 text-xs`}>Quiz PIN not found</span>}
        {quiz?.status === 200 && <span css={tw`font-normal text-gray-400 text-xs`}>Quiz returned 200 ok</span>}
      </div>
    </div>
  );
};

GameIndex.title = "Enter game PIN here!";
export default GameIndex;
