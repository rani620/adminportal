import Layout from "@/components/layout";
import styled from "styled-components";
import Image from "next/image";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { signIn, signout, useSession } from "next-auth/client";
import CardActions from "@material-ui/core/CardActions";
import Profilepage from "@/components/profile";
import { getSession } from "next-auth/client";
import { query } from "@/lib/db";
import { useEffect } from "react";

const Home = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  .image {
    z-index: -1;
    position: absolute;
  }
  .card {
    display: flex;
    justify-content: center;
    text-align: center;
  }
  .title {
    font-size: 24px;
  }
`;

export default function Page({result}) {
  const [session, loading] = useSession();
  useEffect(() => {
    if(session){fetch("/api/gdrive/authorize")}    
  }, [session])
  return (
    <>
      {!session ? (
        <Home>
          <Image
            className="image"
            src="/nitp.png"
            layout="fill"
            objectFit="cover"
            quality={100}
          />
          <Card className="card">
            <CardContent>
              <Image src="/logo512.png" width="100" height="100" />
              <Typography className="title" color="textPrimary">
                Welcome to Admin Portal
              </Typography>

              <CardActions className="card">
                <Button
                  color="secondary"
                  variant="contained"
                  onClick={() => signIn("google")}
                >
                  Login with Google
                </Button>
              </CardActions>
            </CardContent>
          </Card>
        </Home>
      ) : (
          <Layout>
          <Profilepage details={result} />
        </Layout>
      )}
    </>
  );
}

export async function getServerSideProps({ req, res }) {
    const session = await getSession({ req });

  if (session) {
    var details = {};
    // console.log(session.user.email)
    let data = await query(
      `SELECT * FROM users WHERE email="${session.user.email}";`
    ).catch((e) => {
      console.log(e);
    });
    let profile = JSON.parse(JSON.stringify(data))[0];
    details["profile"]=profile;
    let array = [
      "curr_admin_responsibility",
      "education",
      "memberships",
      "past_admin_responsibility",
      "phd_candidates",
      "professional_service",
      "project",
      "publications",
      "subjects_teaching",
      "work_experience",
      "faculty_image"
    ];
    // console.log(profile.id);
    for(let i=0;i<array.length;i++){
      let element=array[i];
      let data = await query(
        `SELECT * FROM ${element} WHERE email="${session.user.email}";`
      ).catch((e) => {
        console.log(e);
      });
      let tmp =JSON.parse(JSON.stringify(data));
      // console.log(JSON.parse(JSON.stringify(tmp)));
      if(tmp[0]!=undefined){
        details[element]=tmp;
      }
    }
    // array.forEach(async(element) => {
    //   let data = await query(
    //     `SELECT * FROM ${element} WHERE email="${session.user.email}";`
    //   ).catch((e) => {
    //     console.log(e);
    //   });
    //   let tmp = JSON.parse(JSON.stringify(data))[0];
    //   console.log(tmp);
    //   details={...details,element:tmp};
    // });
    // console.log(details);
    let result=JSON.parse(JSON.stringify(details));
    // console.log(result);
    
    return {
      props: { result }, // will be passed to the page component as props
    };
  } else {
    return {
      props: {}, // will be passed to the page component as props
    };
  }
}
function asyncForEach(array: string[], arg1: (element: any) => Promise<void>) {
  throw new Error("Function not implemented.");
}
