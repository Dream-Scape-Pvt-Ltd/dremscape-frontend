export default function UiArrow({external=false}:{external?:boolean}){
  return <span className={`ui-arrow${external?' ui-arrow-external':''}`} aria-hidden="true"/>;
}
