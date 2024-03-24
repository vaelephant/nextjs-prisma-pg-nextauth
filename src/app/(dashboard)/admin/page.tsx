import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from  '../../../lib/auth'

const page = async () => {
   const session = await getServerSession(authOptions);
   const email = session?.user?.email;
   const  name = session?.user?.username
   console.log(session?.user?.email);
   return (
     <div>
      <p>This is the dashboard</p>
       <h1>你的邮箱是： {email}</h1>
     
       <h1>你的名称是：{name}</h1>

       <p className=' text-orange-600'>上面的信息都是传过来的</p>
     </div>

   )
};

export default  page

