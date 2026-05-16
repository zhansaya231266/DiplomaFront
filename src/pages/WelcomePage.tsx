import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  UsersIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    icon: UsersIcon,
    title: "Employee Management",
    desc: "Add and manage employees with easy invitation system",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  {
    icon: CalendarDaysIcon,
    title: "Attendance Tracking",
    desc: "Real-time attendance monitoring and reports",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
  },
  {
    icon: CurrencyDollarIcon,
    title: "Automated Payroll",
    desc: "Process salaries automatically with tax calculations",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950",
  },
  {
    icon: ChartBarIcon,
    title: "Reports & Analytics",
    desc: "Comprehensive insights and data visualization",
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950",
  },
];

const steps = [
  {
    num: 1,
    title: "Register Organization",
    desc: "Admin creates an account and sets up the organization workspace",
    circleColor: "border-blue-200 dark:border-blue-800 text-blue-600",
  },
  {
    num: 2,
    title: "Add Employees",
    desc: "Admin adds employees who receive invitation codes via email",
    circleColor: "border-purple-200 dark:border-purple-800 text-purple-600",
  },
  {
    num: 3,
    title: "Start Managing",
    desc: "Track attendance, process payroll, and generate reports seamlessly",
    circleColor: "border-green-200 dark:border-green-800 text-green-600",
  },
];

export const WelcomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header />

      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-950 dark:text-white leading-tight">
            Smart EMP: AI-Enhanced Employee Management with{" "}
            <span className="text-blue-600 dark:text-blue-500">
              Automated Payroll
            </span>
          </h1>
          <p className="mt-5 text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Manage employees, track attendance, process payroll, and generate
            attendance analytics in one connected workspace.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register-org"
              className="group bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            >
              Register Your Organization
              <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/join"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-3 rounded-lg font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition shadow-sm"
            >
              Join with Invitation Code
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl dark:hover:shadow-gray-800/50 hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${feat.bgColor}`}
              >
                <feat.icon className={`h-6 w-6 ${feat.color}`} />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-950 dark:text-white">
                {feat.title}
              </h3>
              <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-950 dark:text-white">
            How It Works
          </h2>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Направляющая линия (видна только на десктопе) */}
            <div className="absolute top-10 left-[15%] right-[15%] h-0.5 bg-gray-100 dark:bg-gray-800 hidden md:block" />

            {steps.map((step) => (
              <div
                key={step.num}
                className="relative flex flex-col items-center group"
              >
                <div
                  className={`w-20 h-20 rounded-full border-2 flex items-center justify-center bg-white dark:bg-gray-900 text-2xl font-bold ${step.circleColor} shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                  {step.num}
                </div>
                <h4 className="mt-8 text-base font-semibold text-gray-950 dark:text-white">
                  {step.title}
                </h4>
                <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm max-w-xs mx-auto">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-800 p-12 md:p-16 rounded-3xl text-center shadow-2xl shadow-blue-500/20">
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            Ready to Transform Employee Management?
          </h2>
          <p className="mt-5 text-base text-blue-100 max-w-2xl mx-auto">
            Join hundreds of companies using Smart EMP
          </p>
          <Link
            to="/join"
            className="mt-12 inline-flex group bg-white text-blue-600 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition items-center gap-2 mx-auto shadow-lg hover:shadow-xl"
          >
            Let's Get Started
            <ArrowRightIcon className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};
