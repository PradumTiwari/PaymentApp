import { PrismaClient } from "../../../packages/db";

 const client=new PrismaClient();
 

export default function Home() {
  return (
    <div className="text-5xl">Hello</div>
  );
}
