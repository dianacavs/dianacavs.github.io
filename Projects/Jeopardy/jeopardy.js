            var clueXML = new XMLHttpRequest(); var reponse;
			var category; var question; var answer; var value;
			var input; var correct = 0; var score; var count = 0; var total = 10;
			var seconds = 20; var timer; var timerId;
			var answerArray = []; var questionArray = []; var inputArray = []; var scoreArray = [];

			function start(){
				var button = document.getElementById( "next" );
				button.addEventListener( "click", processInput, false );

				//plays Jeopardy theme in background during test
				var soundClip = document.getElementById("theme");
				soundClip.play();
				soundClip.loop = true;

				timer = document.getElementById("timer");

				//allow user to press enter key to submit responses
				input = document.getElementById("userinput");
				input.addEventListener("keypress", function(event) {
					if (event.key === 'Enter') {
						event.preventDefault();
						document.getElementById("next").click();
					}
				},false);

				processClue();
			}

			function countdown(){

				if (seconds == 0){//if timer runs out
					clearTimeout(timerId);//clear timer
					seconds = 20;//reset timer for next question
					processInput();
				}
				else{
					if(seconds >=10)
						timer.innerHTML = "0:" + seconds;
					else
						timer.innerHTML = "0:0" + seconds;

					seconds--;//decrease seconds
				}

			}

			function processClue(){
				//forms and sends random clue request to API
				clueXML.open('GET', "https://jservice.io/api/random", true);
				clueXML.setRequestHeader("Accept", "application/json");
				clueXML.send();
				clueXML.onreadystatechange = getClue;
			}

			function getClue(e){
				if (clueXML.readyState === 4 && clueXML.status === 200) {
					response = JSON.parse(clueXML.responseText);
					value = response[0]["value"];
					question = response[0]["question"];
					question = question.replace(/\\/g, '');//gets rid of backslashes returned by JSON object

					if(value > "300" || question.length == 0 || response[0]["invalid_count"] == "null") //only shows clues with a $300 value or lower and doesn't grab faulty/blank questions
						processClue();
					else{
						document.getElementById("count").innerHTML = "<p>Type in your response: &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;Clue " + (count + 1) + "/" + total + "</p>";
						clearInterval(timerId);//clear timer
						seconds = 20;//reset timer
						timerId = setInterval(countdown, 1000);//call countdown function

						//assign API clue attributes to proper variables
						category = response[0]["category"]["title"];
						document.getElementById("category").innerHTML = category;
						document.getElementById("question").innerHTML = question;
						questionArray.push(question);
						answer = response[0]["answer"];
						answer = stripHTML(answer); //remove html formatting (italics)
						answer = answer.replace(/"+/g, '') //gets rid of quote characters
						answer = answer.replace(/[()]/g, ''); //gets rid of parentheses
						answer = answer.replace(/\\/g, ""); //getting rid of backslashes
						answerArray.push(answer);
						//document.getElementById("answer").innerHTML = answer;
					}
				}
			}

			function stripHTML(html){
			//credit - https://ourcodeworld.com/articles/read/376/how-to-strip-html-from-a-string-extract-only-text-content-in-javascript
			//removes html formatting to eliminate marking a correct answer as incorrect
				var temporalDivElement = document.createElement("div");
					// Set the HTML content with the providen
				temporalDivElement.innerHTML = html;
					// Retrieve the text property of the element (cross-browser support)
				return temporalDivElement.textContent || temporalDivElement.innerText || "";
			}

			function levenshtein(a, b){
			//credit - https://rosettacode.org/wiki/Levenshtein_distance#JavaScript
			//returns difference in strings (e.g. levenshtein(cat, hat) returns 1)
				var t = [], u, i, j, m = a.length, n = b.length;
				if (!m) { return n; }
				if (!n) { return m; }
				for (j = 0; j <= n; j++) { t[j] = j; }
				for (i = 1; i <= m; i++) {
					for (u = [i], j = 1; j <= n; j++) {
						u[j] = a[i - 1] === b[j - 1] ? t[j - 1] : Math.min(t[j - 1], t[j], u[j - 1]) + 1;
					} t = u;
				} return u[n];
			}

			function processInput(){

				count++; //updates number of clues that have been shown to user
				//window.alert(count);

				input = document.getElementById("userinput");//gets user input from text box
				input = input.value; //gets string from HTML object
				inputArray.push(input);

				//converts both to lowercase for user ease
				input = input.toLowerCase();
				answer = answer.toLowerCase();

				if(answer == input || levenshtein(answer,input) <= 3 || answer.split(" ").indexOf(input) != -1 || answer == "the " + input || answer == "a " + input){
				//catches small spelling mistakes, partial answers (e.g. only last name entered), and missing definite/indefinite articles
					correct++;
					scoreArray.push("Correct");
				}

				else
					scoreArray.push("Incorrect");

				document.getElementById("userinput").value = ""; //clearing input box
				checkArray = []; //clearing array

				if(count != total) //if game isn't over
					processClue();
				else{
					clearInterval(timerId);
					end();
				}
			}

			function end(){
				//clear out document
				document.body.innerHTML = "";

				//display ending message
				var message = "<h3>Congratulations! You completed the mock Jeopardy game!</h3><h4> You got " + correct + " questions correct out of " + total + ".<br>Here's how you did: </h4>";

				//list game statistics
				for(var i = 0; i < total; i++){
					message += "<h2>Clue " + (i + 1) + ":</h2><ul>";
					message += "<li>Question: " + questionArray[i] + "</li>";
					message += "<li>Correct Answer: " + answerArray[i] + "</li>";
					message += "<li>Your Answer: " + inputArray[i] + "</li></ul>";
					message += "&emsp;&emsp;&emsp;&emsp;<strong>" + scoreArray[i] + "</strong><br>";
				}

				if((correct/total) >= .7)
					message += "<h4>If this were the real Jeopardy test, you'd be invited for a live audition!<br>";
				else
					message += "<h4>If this were the real Jeopardy test, you would not be invited back for for a live audition.<br>";

				message += "Thanks for playing!</h4><br><br>";

				document.body.innerHTML = message;

			}

			window.addEventListener("load", start, false );