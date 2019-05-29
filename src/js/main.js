import "../stylesheets/style.css";
import "font-awesome/css/font-awesome.css";
import Dropzone from "dropzone";
import io from "socket.io-client";
import "../../node_modules/dropzone/dist/basic.css";
import "../../node_modules/dropzone/dist/dropzone.css";

var socket = io();

Dropzone.options.videoDropzone = {
    url: "http://localhost:4000/upload",
    uploadMultiple: false,
    maxFiles: 1,
    paramName: "file",
    maxFilesize: 4000,
    //acceptedFiles: "video/*",
    //renameFile: "UploadedVideo",
    init: function() {
        this.on("addedfile", function(file) {  $(".dz-progress").hide(); });
    },
    uploadprogress: function(file, progress, bytesSent) {
        
        $("#upload-progress-bar").fadeIn(500);
        $("#upload-progress-bar > #progress").css("width", progress+"%");
    },
    complete: (evt) => {
        let filename = evt.name;
        socket.emit('upload message', filename);
        $("#upload-progress-bar").fadeOut(500);
        toggleWrapperBox("#uploadBox");
    }
    
};

function renderMatch(match) {
    let matchNode = $("#templates > .matchFrameContainer")[0].cloneNode(true);
    $("h3", matchNode).text("Similarity score: "+match.matchRate);
    
    $(".qFrame > .frameImage", matchNode).attr("src", "https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500");
    $(".rFrame > .frameImage", matchNode).attr("src", "https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500");

    $(".qFrame > .frameInfo", matchNode).text(match.qFrameIndex);
    $(".rFrame > .frameInfo", matchNode).text(match.rFrameIndex);

    $("#thMatchBox > .matches").append(matchNode);
}

function toggleWrapperBox(boxSelector) {
    $(".content", boxSelector).slideToggle(250, () => {
        if($(".content", boxSelector).is(":visible")) {
            $(".minmaxbtn", boxSelector).text("expand_less");
        }
        else {
            $(".minmaxbtn", boxSelector).text("expand_more");
        }
    });
}

$(document).ready(() => {

    $("#uploadBox").show();

    $(".minmaxbtn").on("click", (evt) => {
        toggleWrapperBox("#"+$(evt.currentTarget).parent().parent()[0].id)
    });

    socket.on('status message', function(msg) {

        if(msg.code == "thGen") {
            $("#thGenBox").show(250);
            //$("#thGenBox > h2").text(msg.title);
            $("#thGenBox > .content > .description").text(msg.desc);
        }

        if(msg.code == "thGenTask") {
            $(".spinner").remove();
            $("#thGenBox > .content > .points").append("<li><div class='taskContainer'><div class='spinner'></div><div class='taskMessageText'>"+msg.title+"</div></div></li>");
        }

        if(msg.code == "thGenTasksDone") {
            $(".spinner").remove();
            toggleWrapperBox("#thGenBox");
        }

        if(msg.code == "thMatch") {
            $("#thMatchBox").show(250);
            $("#thMatchBox > h2").text(msg.title);
            //$("#thMatchBox > .content").html("<div class='spinner'></div>");
        }

        if(msg.code == "thMatchReport") {
            $("#thMatchBox > .content > .points").append("<li>Found "+msg.matches.matches.length+" matches in video \""+msg.matches.rVideo+"\"</li>");
        }

        if(msg.code == "thMatchProgress") {
            console.log(msg);
            $("#thMatchBox .description").html("<div class='spinner'></div>Processed videos: "+msg.processedVideos);
        }

        if(msg.code == "thMatchDone") {
            $(".spinner").remove();
        }

    });

    $(".dz-message > span").html("<i class='material-icons upload-icon'>cloud_upload</i><br />Video upload");

});
