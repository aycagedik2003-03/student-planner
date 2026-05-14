function goPage(page){
    window.location.href = page;
}

function addAppointment(){
    let name = document.getElementById("name").value || "No Name";
    let pet = document.getElementById("pet").value || "No Pet";
    let date = document.getElementById("date").value || "No Date";

    document.getElementById("appointments").innerHTML +=
    `<div style="background:#eef2ff;margin:10px;padding:10px;border-radius:8px">
        ${pet} - ${name} - ${date}
    </div>`;
}