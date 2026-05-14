import {useState} from "react"

function AnOption({id,text,option,actionChecked, reachedMax})
{

    const [isChecked,setIsChecked] = useState(false);

    return <li className='flex items-center'>

        <input id={id} type='checkbox'
            value={option} checked={isChecked} name={option}
disabled={!isChecked && reachedMax}
            onChange={()=>
            {
                setIsChecked(!isChecked);
                actionChecked();
            }}/>

        <label htmlFor={id}>{text}</label>

    </li>;
}

function SubjectsSelector()
{

    const [counter,setCounter] = useState(0);

    function markAsSelected()
    {
        console.log("checked something");
    }

    const subjects=[
        {id:'opt0',text:'Maths',option:'mat'},
        {id:'opt1',text:'English',option:'eng'},
        {id:'opt2',text:'Albanian',option:'alb'},
        {id:'opt3',text:'Italian',option:'ita'},
        {id:'opt4',text:'Turkish',option:'tr'},
    ];

    return <>
        <h3>Select TWO subjects</h3>

        <ul className="max-w-md space-y-1 text-body list-inside">

            {subjects.map((oneSubject,index)=>

                <AnOption key={oneSubject.id}
                    {...oneSubject}
                    actionChecked={markAsSelected}
                     reachedMax={counter>=2}/>

            )}

        </ul>
    </>
}

export default SubjectsSelector;