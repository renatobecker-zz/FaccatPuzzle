
var emptytilePosRow = null;
var emptytilePosCol = null;
var cellDisplacement = "69px";
var listNumbers = [0,1,2,3,4,5,6,7,8];
var solution      = '';
var show_solution = '';
//var initNode = new Node(0, [[8,6,1],[7,2,5],[4,3,0]], 2, 2, 0);
var initNode = randomizeNode();
var goalNode = new Node(0, [[1,2,3],[4,5,6],[7,8,0]], 2, 2, 0);
		
		function moveTile() {
			// Gets the position of the current element
			//console.log('empty tag is ' + emptyTagID);
			var pos = $(this).attr('data-pos');
			var posRow = parseInt(pos.split(',')[0]);
			var posCol = parseInt(pos.split(',')[1]);
			//console.log('posRow = ' + posRow + ' posCol = ' + posCol);
			// Move Up
			if (posRow + 1 == emptytilePosRow && posCol == emptytilePosCol) 
			{
				$(this).animate({
				'top' : "+=" + cellDisplacement //moves up
				});
		
				$('#empty').animate({
				'top' : "-=" + cellDisplacement //moves down
				});
				
				emptytilePosRow-=1;
				$(this).attr('data-pos',(posRow+1) + "," + posCol);
			}
			
			// Move Down
			if (posRow - 1 == emptytilePosRow && posCol == emptytilePosCol) 
			{
				$(this).animate({
				'top' : "-=" + cellDisplacement //moves down
				});
		
				$('#empty').animate({
				'top' : "+=" + cellDisplacement //moves up
				});
				
				emptytilePosRow+=1;
				$(this).attr('data-pos',(posRow-1) + "," + posCol);
			}
			
			// Move Left
			if (posRow == emptytilePosRow && posCol + 1 == emptytilePosCol) 
			{
				$(this).animate({
				'right' : "-=" + cellDisplacement //moves right
				});
		
				$('#empty').animate({
				'right' : "+=" + cellDisplacement //moves left
				});
				
				emptytilePosCol -= 1;
				$(this).attr('data-pos',posRow + "," + (posCol+1));
			}
			
			// Move Right
			if (posRow == emptytilePosRow && posCol - 1 == emptytilePosCol) 
			{
				$(this).animate({
				'right' : "+=" + cellDisplacement //moves left
				});
		
				$('#empty').animate({
				'right' : "-=" + cellDisplacement //moves right
				});
				
				emptytilePosCol += 1;
				$(this).attr('data-pos',posRow + "," + (posCol-1));
			}
			
			// Update empty position
			$('#empty').attr('data-pos',emptytilePosRow + "," + emptytilePosCol);
		}
		
		function Node(value, state, emptyRow, emptyCol, depth) {
			this.value = value
			this.state = state
			this.emptyCol = emptyCol
			this.emptyRow = emptyRow
			this.depth = depth
			this.strRepresentation = ""
			this.path = ""
			
			// String representation of the state in CSV format
			for (var i = 0; i < state.length; i++)
            {
				// We assume the state is a square
				if (state[i].length != state.length) {
					//alert('Number of rows differs from number of columns')
					alert('Número de linhas é diferente do número de colunas');
					return false
				}
			
                for (var j = 0; j < state[i].length; j++)
					this.strRepresentation += state[i][j] + ",";
            }
			
			this.size = this.state.length
		}
		
		Array.prototype.clone = function() 
		{
			return JSON.parse(JSON.stringify(this))
		}
		
		Array.prototype.contains = function(x) 
		{
			for (var i = 0; i < this.length; i++)
				if (this[i] == x) 
					return true;
			
			return false;
		}
		
		function AStar(initial, goal, empty) {
			this.initial = initial
			this.goal = goal
			this.empty = empty
			this.queue = new PriorityQueue({ comparator: function(a, b) { 
															if (a.value > b.value)
																return 1
															if (a.value < b.value)
																return -1
															return 0
														}});
			this.queue.queue(initial);
			this.visited = new HashSet();
		}
		
		AStar.prototype.heuristic = function (node) {
            return this.manhattanDistance(node) + this.manhattanDistance(node);
        }
			
		AStar.prototype.misplacedTiles = function (node) {
            var result = 0;
		 
	        for (var i = 0; i < node.state.length; i++)
			{
			    for (var j = 0; j < node.state[i].length; j++)
                    if (node.state[i][j] != this.goal.state[i][j] && node.state[i][j] != this.empty)
                        result++;
			}
	               
            return result;
        }
		
		AStar.prototype.manhattanDistance = function (node) {
            var result = 0;

                for (var i = 0; i < node.state.length; i++)
                {
                    for (var j = 0; j < node.state[i].length; j++)
                    {
                        var elem = node.state[i][j]
                        var found = false
                        for (var h = 0; h < this.goal.state.length; h++)
                        {
                            for (var k = 0; k < this.goal.state[h].length; k++)
                            {
                                if (this.goal.state[h][k] == elem)
                                {
                                    result += Math.abs(h - i) + Math.abs(j - k)
                                    found = true
                                    break
                                }
                            }
                            if (found) break
                        }
                    }
                }

            return result;
        }
		
		AStar.prototype.linearConflicts = function (node) {
            var result = 0
            var state = node.state

            // Row Conflicts
            for (var i = 0; i < state.length; i++)
                result += this.findConflicts(state, i, 1)

            // Column Conflicts
            for (var i = 0; i < state[0].length; i++)
                result += this.findConflicts(state, i, 0)

            return result
        }
		
		AStar.prototype.findConflicts = function (state, i, dimension) {
            var result = 0;
            var tilesRelated = new Array();

            // Loop foreach pair of elements in the row/column
            for (var h = 0; h < state.length - 1 && !tilesRelated.contains(h); h++)
            {
                for (var k = h + 1; k < state.length && !tilesRelated.contains(h); k++)
                {
                    var moves = dimension == 1 
                        ? this.inConflict(i, state[i][h], state[i][k], h, k, dimension) 
                        : this.inConflict(i, state[h][i], state[k][i], h, k, dimension);
                        
                    if (moves == 0) continue;
                    result += 2
                    tilesRelated.push([h, k ])
                    break
                }
            }

            return result;
        }
		
		AStar.prototype.inConflict = function (index, a, b, indexA, indexB, dimension) {
            var indexGoalA = -1
            var indexGoalB = -1

            for (var c = 0; c < this.goal.state.length; c++)
            {
                if (dimension == 1 && this.goal.state[index][c] == a)
                    indexGoalA = c;
                else if (dimension == 1 && this.goal.state[index][c] == b)
                    indexGoalB = c;
                else if (dimension == 0 && this.goal.state[c][index] == a)
                    indexGoalA = c;
                else if (dimension == 0 && this.goal.state[c][index] == b)
                    indexGoalB = c;
            }

            return (indexGoalA >= 0 && indexGoalB >= 0) && 
			       ((indexA < indexB && indexGoalA > indexGoalB) ||
                   (indexA > indexB && indexGoalA < indexGoalB))
                           ? 2
                           : 0;
        }
		
		AStar.prototype.execute = function () {
			// Add current state to visited list
			this.visited.add(this.initial.strRepresentation)
			while (this.queue.length > 0) {				

				var current = this.queue.dequeue();
				var current_rep = current.strRepresentation;
				console.log(current_rep);
				refreshPanel('');
				refreshPanel(current_rep);
				if (current.strRepresentation == this.goal.strRepresentation) {
					return current;
				}	
				this.expandNode(current);
			}
		}
		
		AStar.prototype.expandNode = function (node) {
            var temp = ''
            var newState = ''
            var col = node.emptyCol
            var row = node.emptyRow
            var newNode = ''
			
            // Up
            if (row > 0)
            {
                newState = node.state.clone();
                temp = newState[row - 1][col]
                newState[row - 1][col] = this.empty
                newState[row][col] = temp
                newNode = new Node(0, newState, row - 1, col,  node.depth + 1)
                
                if (!this.visited.contains(newNode.strRepresentation))
                {
                    newNode.value = newNode.depth + this.heuristic(newNode)
					newNode.path = node.path + "U"
                    this.queue.queue(newNode)
                    this.visited.add(newNode.strRepresentation)
                }
            }
			
            // Down
            if (row < node.size - 1)
            {
                newState = node.state.clone();
                temp = newState[row + 1][col]
                newState[row + 1][col] = this.empty
                newState[row][col] = temp
                newNode = new Node(0, newState, row + 1, col,  node.depth + 1)
				
                if (!this.visited.contains(newNode.strRepresentation))
                {
				    newNode.value = newNode.depth + this.heuristic(newNode)
					newNode.path = node.path + "D"
                    this.queue.queue(newNode)
                    this.visited.add(newNode.strRepresentation)
                }
            }
			
            // Left
            if (col > 0)
            {
                newState = node.state.clone();
                temp = newState[row][col - 1]
                newState[row][col - 1] = this.empty
                newState[row][col] = temp
                newNode = new Node(0, newState, row, col - 1, node.depth + 1)
                
                if (!this.visited.contains(newNode.strRepresentation))
                {
                    newNode.value = newNode.depth + this.heuristic(newNode)
					newNode.path = node.path + "L"
                    this.queue.queue(newNode)
                    this.visited.add(newNode.strRepresentation)
                }
            }

            // Right
            if (col < node.size - 1)
            {
                newState = node.state.clone();
                temp = newState[row][col + 1]
                newState[row][col + 1] = this.empty
                newState[row][col] = temp
                newNode = new Node(0, newState, row, col + 1, node.depth + 1)
                    
                if (!this.visited.contains(newNode.strRepresentation))
                {
                    newNode.value = newNode.depth + this.heuristic(newNode)
					newNode.path = node.path + "R"
                    this.queue.queue(newNode)
                    this.visited.add(newNode.strRepresentation)
                }
            }
        }

		function shuffleArray(a) {
    		var j, x, i;
    		for (i = a.length; i; i -= 1) {
        		j = Math.floor(Math.random() * i);
        		x = a[i - 1];
        		a[i - 1] = a[j];
        		a[j] = x;
    		}
		}

		//Este método determina se o array passado por parâmetro
  		//pode ser resolvido
  		function isSolvable(a) {

    		var inversions = 0;
    
		    for(i = 0; i < a.length - 1; i++) {

      			for( j = i + 1; j < a.length; j++)
        			if(a[i] > a[j]) 
        				inversions++;

      			if(a[i] == 0 && i % 2 == 1) 
      				inversions++;
    		}
    		
    		return (inversions % 2 == 0);
  		}		

        function randomizeNode() {
        	var ok = false;

        	while (ok == false) {
  	        	var tempList = listNumbers;
				shuffleArray(tempList);
				ok = isSolvable(tempList);
        	}

			var temp1 = tempList.slice(0,3);
        	var temp2 = tempList.slice(3,6);
        	var temp3 = tempList.slice(6,9);

			var temp_array = [temp1, temp2, temp3];
				
            for (var i = 0; i < temp_array.length; i++) {
                for (var j = 0; j < temp_array[i].length; j++) {
                    var elem = temp_array[i][j];
 					
					if (elem == 0) {
						emptytilePosRow = i;
						emptytilePosCol = j;
					}
                }
            }
			
			var newNode = new Node(0, temp_array, emptytilePosRow, emptytilePosCol, 0);
			console.log(newNode);
			return newNode;
        }

		function reset() {
			refreshPanel('');
			solution      = '';
			show_solution = '';
        	initNode = randomizeNode();
        	buildHtmlNode(initNode, 'grid-start', ".start .cell");  			
		}

		function buildHtmlNode(node, elementID, classClick) {
			
			var html_id  = '#' + elementID;
            var html_str = '';

            for (var i = 0; i < node.state.length; i++) {
				html_str += '<div class="row">';
                for (var j = 0; j < node.state[i].length; j++) {
                    var elem = node.state[i][j];
 					
                    var html_value = ((elem > 0) ? elem : '');
                    var html_empty = ((elem > 0) ? '' : ' id="empty"'); 

					html_str +='<div class="cell"' + html_empty + ' data-pos="' + i + ',' + j +'"><span>' + html_value + '</span></div>';
                }
                html_str += '</div>';
            }
			$(html_id).html(html_str);

			var emptyTagID = html_id + '-empty';

			$(classClick).unbind('click').click(moveTile);
		}	

		function refreshPanel(text) {
			var panel = document.getElementById('panel');
			panel.innerHTML = text;
		}

		function start() {

			if (solution == '') {

				var astar = new AStar(initNode, goalNode, 0)

				var startTime = new Date();
				// Execute AStar
				var result = astar.execute();
				//--------------------------
				var endTime = new Date();
				//alert('Completed in: ' + (endTime - startTime) + ' milliseconds')
				refreshPanel('');			
				var text = 'Solução: ' + result.path + 
			    	              '<br> Total Passos: ' + result.path.length + 
			        	          '<br> Tempo total: ' + + (endTime - startTime) + ' milisegundos';
				refreshPanel(text);                  

				solution = result.path;
			}

			console.log(solution);
		}
		
		function showSolution(index) {			
			var move = ''

			switch(solution[index]) {
				case "R":
					move =  (emptytilePosRow).toString() + ',' + (emptytilePosCol + 1).toString()
					break
				case "L":
					move =  (emptytilePosRow).toString() + ',' + (emptytilePosCol - 1).toString()
					break
				case "U":
					move =  (emptytilePosRow - 1).toString() + ',' + (emptytilePosCol).toString()
					break
				case "D":
					move =  (emptytilePosRow + 1).toString() + ',' + (emptytilePosCol).toString()
					break
			}
			
			$("div[data-pos='" + move + "']").click();

			panel.innerHTML += 'Step: ' + index + ' -> ' + solution[index] + ' ,';
		}
		
		function showStepByStep() {

			if ((solution != '') && (solution != show_solution)) {
				for (var i = 0; i < solution.length; i++) {
    				showSolution(i);
				};			
			};

			show_solution = solution;
		}

		$(document).ready(function() {		
			buildHtmlNode(initNode, 'grid-start', ".start .cell");  			
			//buildHtmlNode(goalNode, 'grid-goal', ".goal .cell");  	
		});

		
		
		