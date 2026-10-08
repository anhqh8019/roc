import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getCustomerTrend, getRevenueUnitTrend } from "../api/businessInsightsApi";
import type { CustomerTrendResponse, RevenueUnitTrendResponse } from "../types/businessInsights";

interface Props { businessDate:string; }
type Period="WEEK"|"MONTH"|"THREE_MONTHS";
const DAYS:Record<Period,number>={WEEK:7,MONTH:30,THREE_MONTHS:90};

function shortDate(value:string){ const p=value.split("-"); return p.length===3?`${p[2]}/${p[1]}`:value; }
function money(value:number){ return new Intl.NumberFormat("vi-VN",{maximumFractionDigits:0}).format(value); }

export default function BusinessInsightsPanel({businessDate}:Props){
  const [period,setPeriod]=useState<Period>("WEEK");
  const [customers,setCustomers]=useState<CustomerTrendResponse|null>(null);
  const [revenue,setRevenue]=useState<RevenueUnitTrendResponse|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(false);
  const days=DAYS[period];

  useEffect(()=>{
    let cancelled=false;
    async function load(){
      setLoading(true); setError(false);
      const [c,r]=await Promise.allSettled([getCustomerTrend(businessDate,days),getRevenueUnitTrend(businessDate,days)]);
      if(cancelled)return;
      setCustomers(c.status==="fulfilled"?c.value:null);
      setRevenue(r.status==="fulfilled"?r.value:null);
      setError(c.status==="rejected"&&r.status==="rejected");
      setLoading(false);
    }
    load(); return()=>{cancelled=true;};
  },[businessDate,days]);

  const interval=period==="WEEK"?0:period==="MONTH"?4:14;

  if(loading)return <div style={{minHeight:360,display:"grid",placeItems:"center",color:"#64748b",fontSize:11}}>Đang tải phân tích kinh doanh...</div>;
  if(error)return <div style={{minHeight:360,display:"grid",placeItems:"center",color:"#f87171",fontSize:11}}>Không tải được dữ liệu phân tích kinh doanh.</div>;

  return <div style={{display:"grid",gap:14,width:"100%"}}>
    <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center"}}>
      <select value={period} onChange={e=>setPeriod(e.target.value as Period)} style={{background:"#071827",color:"#cbd5e1",border:"1px solid #18506c",borderRadius:6,padding:"5px 24px 5px 9px",fontSize:9}}>
        <option value="WEEK">1 tuần</option><option value="MONTH">1 tháng</option><option value="THREE_MONTHS">3 tháng</option>
      </select>
    </div>

    {customers&&<section style={{borderBottom:"1px solid rgba(148,163,184,.12)",paddingBottom:12}}>
      <div style={{textAlign:"center",marginBottom:5}}><div style={{fontSize:12,fontWeight:700,color:"#e2e8f0"}}>Xu hướng khách hàng</div><div style={{fontSize:8,color:"#64748b",marginTop:2}}>Customer Analysis</div></div>
      <div style={{height:155}}><ResponsiveContainer width="100%" height="100%"><LineChart data={customers.data} margin={{top:8,right:12,left:-18,bottom:0}}>
        <CartesianGrid stroke="rgba(148,163,184,.09)" strokeDasharray="3 3" vertical={false}/>
        <XAxis dataKey="date" tickFormatter={shortDate} interval={interval} tick={{fill:"#64748b",fontSize:7}} axisLine={false} tickLine={false}/>
        <YAxis allowDecimals={false} tick={{fill:"#64748b",fontSize:7}} axisLine={false} tickLine={false}/>
        <Tooltip labelFormatter={v=>`Ngày ${shortDate(String(v))}`} contentStyle={{background:"#0b1d2b",border:"1px solid #21445d",borderRadius:7,color:"#fff",fontSize:9}}/>
        <Legend wrapperStyle={{fontSize:8}} iconType="circle" iconSize={7}/>
        <Line type="monotone" dataKey="adults" name="Adult" stroke="#22c7ff" strokeWidth={2.2} dot={period==="WEEK"?{r:2}:false}/>
        <Line type="monotone" dataKey="children" name="Child" stroke="#19bf73" strokeWidth={2.2} dot={period==="WEEK"?{r:2}:false}/>
      </LineChart></ResponsiveContainer></div>
      {customers.data.some(x=>x.unknownAge>0)&&<div style={{fontSize:7,color:"#64748b",textAlign:"right",marginTop:2}}>* Adult/Child phân loại theo BirthDate; khách thiếu ngày sinh không đưa vào 2 đường.</div>}
    </section>}

    {revenue&&<section>
      <div style={{textAlign:"center",marginBottom:5}}><div style={{fontSize:12,fontWeight:700,color:"#e2e8f0"}}>Xu hướng doanh thu</div><div style={{fontSize:8,color:"#64748b",marginTop:2}}>Revenue Analysis</div></div>
      <div style={{height:165}}><ResponsiveContainer width="100%" height="100%"><LineChart data={revenue.data} margin={{top:8,right:12,left:-12,bottom:0}}>
        <CartesianGrid stroke="rgba(148,163,184,.09)" strokeDasharray="3 3" vertical={false}/>
        <XAxis dataKey="date" tickFormatter={shortDate} interval={interval} tick={{fill:"#64748b",fontSize:7}} axisLine={false} tickLine={false}/>
        <YAxis tickFormatter={v=>`${Math.round(Number(v)/1_000_000)}m`} tick={{fill:"#64748b",fontSize:7}} axisLine={false} tickLine={false}/>
        <Tooltip labelFormatter={v=>`Ngày ${shortDate(String(v))}`} formatter={(v,name)=>[`${money(Number(v))} đ`,String(name)]} contentStyle={{background:"#0b1d2b",border:"1px solid #21445d",borderRadius:7,color:"#fff",fontSize:9}}/>
        <Legend wrapperStyle={{fontSize:8}} iconType="circle" iconSize={7}/>
        <Line type="monotone" dataKey="hotel" name="Hotel" stroke="#22c7ff" strokeWidth={2} dot={false}/>
        <Line type="monotone" dataKey="foodBeverage" name="F&B" stroke="#19bf73" strokeWidth={2} dot={false}/>
        <Line type="monotone" dataKey="onsen" name="Onsen" stroke="#f59e0b" strokeWidth={2} dot={false}/>
        <Line type="monotone" dataKey="spa" name="Spa" stroke="#8b5cf6" strokeWidth={2} dot={false}/>
        <Line type="monotone" dataKey="other" name="Other" stroke="#94a3b8" strokeWidth={2} dot={false}/>
      </LineChart></ResponsiveContainer></div>
    </section>}
  </div>;
}
