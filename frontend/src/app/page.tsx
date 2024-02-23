import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <>
    <div className={styles.containerrr}>
    <Link href="/studentlogin">
    <button className="rounded-l-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-6 px-12 mr-5 transition duration-300 ease-in-out">Student</button>
    </Link>
    <Link href="/teacherlogin">
      <button className="rounded-r-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-6 px-12 transition duration-300 ease-in-out">Teacher</button>
      </Link>
    </div>
    </>
  );
}
