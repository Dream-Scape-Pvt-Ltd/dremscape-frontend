import {ImageResponse} from 'next/og';

export const size={width:1200,height:630};
export const contentType='image/png';

export default function OpenGraphImage(){
  return new ImageResponse(
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'70px 76px',color:'#f8f3dc',background:'radial-gradient(circle at 83% 72%, #8e8b42 0%, #2e6647 39%, #123a2b 78%)'}}>
      <div style={{display:'flex',alignItems:'center',gap:18,fontSize:28,fontWeight:700,letterSpacing:2}}><span style={{width:40,height:40,border:'3px solid #e5bd69',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'#e5bd69'}}>D</span>DREAMSCAPE TREKS</div>
      <div style={{display:'flex',flexDirection:'column',gap:18}}><div style={{fontSize:76,fontWeight:700,lineHeight:1.05}}>Beyond the Horizon</div><div style={{fontSize:27,color:'#ead29c'}}>Trekking journeys across Nepal</div></div>
      <div style={{height:5,width:160,background:'#e4b760',borderRadius:5}} />
    </div>,size);
}
