
package main

import (
    "encoding/json"
    "fmt"
	"io/ioutil"
    "net/http"
)

type response1 struct {
	Page int;
	Fruits [] string
}

func main() {
 
	booleanBytes, _ := json.Marshal(true);
	fmt.Println(string(booleanBytes));

	integerBytes, _ := json.Marshal(1);
	fmt.Println(string(integerBytes));

	var stringOfArrays []string;
	stringOfArrays = []string{"apple", "tuesday"};
	_ = stringOfArrays

	b := [5]int{1, 2, 3, 4, 5}
    fmt.Println("dcl:", b)

	b = [...]int{1, 2, 3, 4, 5}
    fmt.Println("dcl:", b)

	fmt.Println(b);
	var intSlice []int;
	intSlice = append(intSlice, 4)

	url := "https://dummy.restapiexample.com/api/v1/employees"

	req, err := http.NewRequest("GET", url, nil)
	if(err!= nil){
		fmt.Println(err);
	}
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println(err);
	}
	defer resp.Body.Close();
	body, err := ioutil.ReadAll(resp.Body)
	fmt.Println(string(body))
}