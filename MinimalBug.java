// Save as `MinimalBug.java`
public class MinimalBug {

    interface MyInterface {
        static void doSomething() {
            // This is a static method in an interface (Java 8+)
        }
    }

    public static void main(String[] args) {
        // This call to the static interface method creates a
        // MethodRef in the constant pool that the parser fails on.
        MyInterface.doSomething();
    }
}