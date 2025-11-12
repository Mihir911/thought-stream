import React from 'react';

const About = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold mb-4">About BlogSpace</h2>
      <p className="text-gray-700 mb-4">
        BlogSpace is a modern blogging platform built to help writers share stories and readers discover content they'll love.
        This project is a MERN-stack example that includes personalization, bookmarking, and an intelligent feed.
      </p>
      <h3 className="text-xl font-semibold mt-6">Our mission</h3>
      <p className="text-gray-700">We want to foster thoughtful writing and make it easy for readers to find the posts they care about.</p>
      <h3 className="text-xl font-semibold mt-6">Team</h3>
      <p className="text-gray-700">This project is maintained by the BlogSpace community.</p>
    </div>
  );
};

export default About;