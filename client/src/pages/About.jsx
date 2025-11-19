import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  PenTool, 
  TrendingUp, 
  BookOpen, 
  Heart, 
  Target,
  Globe,
  Award,
  ArrowRight
} from 'lucide-react';

const AboutUs = () => {
  const features = [
    {
      icon: PenTool,
      title: 'Beautiful Writing Experience',
      description: 'Our distraction-free editor lets you focus on what matters most - your writing.'
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Audience',
      description: 'Reach readers who care about your topics and build your writing career.'
    },
    {
      icon: BookOpen,
      title: 'Personalized Discovery',
      description: 'Discover content tailored to your interests and reading habits.'
    },
    {
      icon: Users,
      title: 'Vibrant Community',
      description: 'Connect with fellow writers and readers through meaningful interactions.'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Active Writers' },
    { number: '50K+', label: 'Stories Published' },
    { number: '1M+', label: 'Monthly Readers' },
    { number: '99%', label: 'Satisfaction Rate' }
  ];

  const team = [
    {
      name: 'Alex Johnson',
      role: 'Founder & CEO',
      bio: 'Passionate about creating spaces where stories can thrive and connect people.'
    },
    {
      name: 'Sarah Chen',
      role: 'Head of Design',
      bio: 'Believes that beautiful design should enhance, not distract from, great writing.'
    },
    {
      name: 'Mike Rodriguez',
      role: 'Lead Developer',
      bio: 'Loves building technology that brings people together through shared stories.'
    },
    {
      name: 'Emily Davis',
      role: 'Community Manager',
      bio: 'Dedicated to fostering a supportive and engaging community for all members.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-primary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              About <span className="text-primary-600">BlogSpace</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              We're building a home for writers and readers to connect, share stories, 
              and discover the magic of storytelling. Our mission is to make writing 
              accessible and rewarding for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/feed"
                className="bg-primary-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
              >
                Explore Stories
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/register"
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors"
              >
                Join Our Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We believe that everyone has a story worth telling. BlogSpace was founded 
                to create a platform where voices can be heard, stories can be shared, 
                and communities can form around shared interests and passions.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Whether you're a seasoned writer or just starting your journey, 
                we provide the tools, community, and support you need to share 
                your unique perspective with the world.
              </p>
              <div className="flex items-center gap-4">
                <Target className="h-8 w-8 text-primary-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Our Vision</h3>
                  <p className="text-gray-600">To be the most welcoming platform for writers worldwide</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 text-white">
              <Heart className="h-12 w-12 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Why We Do It</h3>
              <p className="text-lg mb-4">
                Stories have the power to connect us, teach us, and help us understand 
                different perspectives. In a world that often feels divided, we believe 
                storytelling can bring people together.
              </p>
              <p className="text-lg">
                Every story shared on BlogSpace contributes to a richer, more diverse 
                tapestry of human experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-gray-600">
              Join a growing community of writers and readers
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose BlogSpace?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've built everything you need to share your stories and connect with readers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600">
              Passionate individuals dedicated to making BlogSpace amazing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <Globe className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Diversity & Inclusion
              </h3>
              <p className="text-gray-600">
                We celebrate diverse voices and perspectives from around the world. 
                Every story matters, and every voice deserves to be heard.
              </p>
            </div>
            <div className="text-center p-6">
              <Award className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Quality First
              </h3>
              <p className="text-gray-600">
                We're committed to maintaining high standards while keeping our 
                platform accessible to writers at all levels of experience.
              </p>
            </div>
            <div className="text-center p-6">
              <Heart className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Community Driven
              </h3>
              <p className="text-gray-600">
                Our platform grows and improves based on feedback from our community. 
                Your experience shapes our future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Join Our Story?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Become part of a community that values your voice and supports your writing journey
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Start Writing Today
            </Link>
            <Link
              to="/feed"
              className="border border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors"
            >
              Explore Stories First
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;