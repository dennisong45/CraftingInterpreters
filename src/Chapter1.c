#include <stdio.h>
#include <stdlib.h>

    struct Node {
        int data;
        struct Node* next;
        struct Node* prev;
    };

    struct LinkedList {
        int size;
        struct Node* head;
    };

    struct LinkedList* createLinkedList(int initialSize) {
        struct LinkedList* list = (struct LinkedList*)malloc(sizeof(struct LinkedList));
        if (list != NULL) {
            list->size = 0; // Start with size 0 as no nodes are added yet
            list->head = NULL;  // Initialize the head to NULL, indicating an empty list
        }
        return list;
    };

    void addNode(struct LinkedList* list, int data) {
        struct Node* newNode =(struct Node*)malloc(sizeof(struct Node));
        if (newNode != NULL){
            newNode->data = data; // New node data
            newNode->next = list->head; //  [ X ] // [ X
            newNode->prev
            list->head = newNode;
            list->size++;
        }
    }

    void printList(struct LinkedList* list) {
        struct Node* temp = list->head;
        while(temp != NULL){
            printf("List Data %d\n", temp->data );
            temp = temp->next;
        }
    }


int main() {
    struct LinkedList* list = createLinkedList(5);
    addNode(list, 10);
    addNode(list, 20);
   printList(list);
//    struct Node* current = list->head;
//    struct Node* next;
//    while (current != NULL) {
//        next = current->next;
//        free(current);
//        current = next;
//    }
//    free(list);
}
